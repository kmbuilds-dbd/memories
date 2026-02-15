"use server";

import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/openai";
import type { EmbeddingStatus } from "@/types";

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
      const embedding = await generateEmbedding(row.content as string);
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
