"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import type { EmbeddingStatus, UserAISettings } from "@/types";

export async function getEmbeddingStatus(): Promise<EmbeddingStatus> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { totalMemories: 0, embeddedCount: 0, unembeddedCount: 0 };
  }

  const [totalRes, unembeddedRes] = await Promise.all([
    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.rpc("count_unembedded_memories", { p_user_id: user.id }),
  ]);

  const totalMemories = totalRes.count ?? 0;
  const unembeddedCount = Number(unembeddedRes.data ?? 0);
  const embeddedCount = totalMemories - unembeddedCount;

  return { totalMemories, embeddedCount, unembeddedCount };
}

export async function backfillEmbeddings(): Promise<{
  processed: number;
  remaining: number;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { processed: 0, remaining: 0 };
  }

  const provider = await getAIProvider();
  if (!provider) {
    return { processed: 0, remaining: 0 };
  }

  // Fetch a batch of unembedded memories
  const { data: rows } = await supabase
    .from("memories")
    .select("id, content")
    .eq("user_id", user.id)
    .is("embedding", null)
    .order("created_at", { ascending: true })
    .limit(25);

  if (!rows || rows.length === 0) {
    return { processed: 0, remaining: 0 };
  }

  let processed = 0;
  for (const row of rows) {
    try {
      const embedding = await provider.embedding.generateEmbedding(row.content as string);
      await supabase
        .from("memories")
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", row.id);
      processed++;
    } catch {
      // Skip failures, continue with next
    }
  }

  // Get updated remaining count
  const { data: remainingData } = await supabase.rpc(
    "count_unembedded_memories",
    { p_user_id: user.id }
  );
  const remaining = Number(remainingData ?? 0);

  return { processed, remaining };
}

export async function getAISettings(): Promise<UserAISettings | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data } = await supabase
    .from("user_ai_settings")
    .select("*")
    .eq("user_id", user.id)
    .single<UserAISettings>();

  return data;
}

export async function saveAISettings(settings: {
  provider: "openai" | "ollama" | null;
  openai_api_key?: string | null;
  ollama_base_url?: string | null;
  ollama_embedding_model?: string | null;
  ollama_chat_model?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const row = {
    user_id: user.id,
    provider: settings.provider,
    openai_api_key: settings.openai_api_key ?? null,
    ollama_base_url: settings.ollama_base_url ?? "http://localhost:11434",
    ollama_embedding_model: settings.ollama_embedding_model ?? "nomic-embed-text",
    ollama_chat_model: settings.ollama_chat_model ?? "llama3.2",
    embedding_dimensions: settings.provider === "ollama" ? 768 : 1536,
  };

  const { error } = await supabase
    .from("user_ai_settings")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function testAIConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = await getAIProvider();
    if (!provider) {
      return { success: false, error: "No AI provider configured" };
    }

    // Test embedding
    const embedding = await provider.embedding.generateEmbedding("test connection");
    if (!embedding || embedding.length === 0) {
      return { success: false, error: "Embedding generation returned empty result" };
    }

    // Test chat
    const reply = await provider.chat.chatCompletion({
      messages: [{ role: "user", content: "Say 'ok' and nothing else." }],
      temperature: 0,
    });
    if (!reply) {
      return { success: false, error: "Chat completion returned empty result" };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection test failed",
    };
  }
}

export async function clearUserEmbeddings(): Promise<{ success: boolean; cleared: number }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, cleared: 0 };
  }

  // Count how many have embeddings before clearing
  const { count } = await supabase
    .from("memories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("embedding", "is", null);

  // Clear all embeddings
  await supabase
    .from("memories")
    .update({ embedding: null })
    .eq("user_id", user.id)
    .not("embedding", "is", null);

  return { success: true, cleared: count ?? 0 };
}
