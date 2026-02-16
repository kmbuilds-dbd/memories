export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

export interface ChatCompletionParams {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  response_format?: { type: "json_object" };
}

export interface ChatProvider {
  chatCompletion(params: ChatCompletionParams): Promise<string | null>;
}

export interface AIProvider {
  embedding: EmbeddingProvider;
  chat: ChatProvider;
}
