import type { EmbeddingProvider, ChatProvider, ChatCompletionParams } from "./types";

const TARGET_DIMENSIONS = 1536;

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.model = model;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, input: text }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama embed failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    const embedding: number[] = data.embeddings[0];

    // Zero-pad to TARGET_DIMENSIONS for pgvector compatibility
    if (embedding.length < TARGET_DIMENSIONS) {
      const padded = new Array(TARGET_DIMENSIONS).fill(0);
      for (let i = 0; i < embedding.length; i++) {
        padded[i] = embedding[i];
      }
      return padded;
    }

    return embedding.slice(0, TARGET_DIMENSIONS);
  }
}

export class OllamaChatProvider implements ChatProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.model = model;
  }

  async chatCompletion(params: ChatCompletionParams): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: params.messages,
        stream: false,
        options: {
          temperature: params.temperature ?? 0.7,
        },
        ...(params.response_format?.type === "json_object" ? { format: "json" } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama chat failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    return data.message?.content ?? null;
  }
}
