import OpenAI from "openai";
import type { EmbeddingProvider, ChatProvider, ChatCompletionParams } from "./types";

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }
}

export class OpenAIChatProvider implements ChatProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chatCompletion(params: ChatCompletionParams): Promise<string | null> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      response_format: params.response_format,
    });
    return response.choices[0]?.message?.content ?? null;
  }
}
