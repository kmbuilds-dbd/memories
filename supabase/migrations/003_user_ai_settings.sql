-- User AI Settings: per-user BYOK keys and Ollama configuration
CREATE TABLE user_ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  provider TEXT CHECK (provider IN ('openai', 'ollama')) DEFAULT NULL,
  openai_api_key TEXT,
  ollama_base_url TEXT DEFAULT 'http://localhost:11434',
  ollama_embedding_model TEXT DEFAULT 'nomic-embed-text',
  ollama_chat_model TEXT DEFAULT 'llama3.2',
  embedding_dimensions INT DEFAULT 1536,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE user_ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own ai_settings" ON user_ai_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER user_ai_settings_updated_at
  BEFORE UPDATE ON user_ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
