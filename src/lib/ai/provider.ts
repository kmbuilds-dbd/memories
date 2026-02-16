import { createClient } from "@/lib/supabase/server";
import type { AIProvider } from "./types";
import type { UserAISettings } from "@/types";
import { OpenAIEmbeddingProvider, OpenAIChatProvider } from "./openai-provider";
import { OllamaEmbeddingProvider, OllamaChatProvider } from "./ollama-provider";

export async function getAIProvider(): Promise<AIProvider | null> {
  // 1. Check user's per-user settings
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: settings } = await supabase
      .from("user_ai_settings")
      .select("*")
      .eq("user_id", user.id)
      .single<UserAISettings>();

    if (settings?.provider === "openai" && settings.openai_api_key) {
      return {
        embedding: new OpenAIEmbeddingProvider(settings.openai_api_key),
        chat: new OpenAIChatProvider(settings.openai_api_key),
      };
    }

    if (settings?.provider === "ollama" && settings.ollama_base_url) {
      return {
        embedding: new OllamaEmbeddingProvider(
          settings.ollama_base_url,
          settings.ollama_embedding_model || "nomic-embed-text"
        ),
        chat: new OllamaChatProvider(
          settings.ollama_base_url,
          settings.ollama_chat_model || "llama3.2"
        ),
      };
    }
  }

  // 2. Fall back to server-level OPENAI_API_KEY
  const serverKey = process.env.OPENAI_API_KEY;
  if (serverKey) {
    return {
      embedding: new OpenAIEmbeddingProvider(serverKey),
      chat: new OpenAIChatProvider(serverKey),
    };
  }

  // 3. AI disabled
  return null;
}

export async function generateEmbeddingForUser(text: string): Promise<number[] | null> {
  const provider = await getAIProvider();
  if (!provider) return null;
  return provider.embedding.generateEmbedding(text);
}

export async function isAIConfigured(): Promise<boolean> {
  const provider = await getAIProvider();
  return provider !== null;
}
