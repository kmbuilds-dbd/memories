"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  saveAISettings,
  testAIConnection,
  clearUserEmbeddings,
} from "@/app/dashboard/settings/actions";
import type { UserAISettings } from "@/types";

interface AIProviderSettingsProps {
  initialSettings: UserAISettings | null;
  hasServerKey: boolean;
}

export function AIProviderSettings({
  initialSettings,
  hasServerKey,
}: AIProviderSettingsProps) {
  const [provider, setProvider] = useState<"openai" | "ollama" | "none">(
    initialSettings?.provider ?? "none"
  );
  const [openaiKey, setOpenaiKey] = useState(initialSettings?.openai_api_key ?? "");
  const [ollamaUrl, setOllamaUrl] = useState(
    initialSettings?.ollama_base_url ?? "http://localhost:11434"
  );
  const [ollamaEmbedModel, setOllamaEmbedModel] = useState(
    initialSettings?.ollama_embedding_model ?? "nomic-embed-text"
  );
  const [ollamaChatModel, setOllamaChatModel] = useState(
    initialSettings?.ollama_chat_model ?? "llama3.2"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showProviderWarning, setShowProviderWarning] = useState(false);

  const originalProvider = initialSettings?.provider ?? null;

  const handleProviderChange = (value: string) => {
    const newProvider = value as "openai" | "ollama" | "none";
    setProvider(newProvider);
    setTestResult(null);
    setSaveMessage(null);

    // Show warning if changing from a configured provider
    const newProviderValue = newProvider === "none" ? null : newProvider;
    if (originalProvider && newProviderValue !== originalProvider) {
      setShowProviderWarning(true);
    } else {
      setShowProviderWarning(false);
    }
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setTestResult(null);

    const providerValue = provider === "none" ? null : provider;

    // If switching providers and had embeddings, clear them
    if (originalProvider && providerValue !== originalProvider) {
      await clearUserEmbeddings();
    }

    const result = await saveAISettings({
      provider: providerValue,
      openai_api_key: provider === "openai" ? openaiKey : null,
      ollama_base_url: provider === "ollama" ? ollamaUrl : null,
      ollama_embedding_model: provider === "ollama" ? ollamaEmbedModel : null,
      ollama_chat_model: provider === "ollama" ? ollamaChatModel : null,
    });

    if (result.success) {
      setSaveMessage("Settings saved");
      setShowProviderWarning(false);
    } else {
      setSaveMessage(result.error ?? "Failed to save");
    }

    setIsSaving(false);
  }, [provider, openaiKey, ollamaUrl, ollamaEmbedModel, ollamaChatModel, originalProvider]);

  const handleTest = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testAIConnection();
    setTestResult(result);
    setIsTesting(false);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Provider
        </CardTitle>
        <CardDescription>
          Configure your AI provider for semantic search, embeddings, and tag
          discovery.
          {hasServerKey && (
            <span className="block mt-1 text-xs">
              A server-level OpenAI key is configured as fallback.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (use server default)</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="ollama">Ollama (self-hosted)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showProviderWarning && (
          <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Changing providers will clear your existing embeddings. You will
              need to re-generate them after saving.
            </span>
          </div>
        )}

        {provider === "openai" && (
          <div className="space-y-2">
            <Label htmlFor="openai-key">API Key</Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
          </div>
        )}

        {provider === "ollama" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Ollama URL</Label>
              <Input
                id="ollama-url"
                type="text"
                placeholder="http://localhost:11434"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ollama-embed">Embedding Model</Label>
              <Input
                id="ollama-embed"
                type="text"
                placeholder="nomic-embed-text"
                value={ollamaEmbedModel}
                onChange={(e) => setOllamaEmbedModel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ollama-chat">Chat Model</Label>
              <Input
                id="ollama-chat"
                type="text"
                placeholder="llama3.2"
                value={ollamaChatModel}
                onChange={(e) => setOllamaChatModel(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>

          {provider !== "none" && (
            <Button variant="outline" onClick={handleTest} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          )}
        </div>

        {saveMessage && (
          <p
            className={`text-sm ${
              saveMessage === "Settings saved"
                ? "text-green-600 dark:text-green-400"
                : "text-destructive"
            }`}
          >
            {saveMessage}
          </p>
        )}

        {testResult && (
          <div
            className={`flex items-center gap-2 text-sm ${
              testResult.success
                ? "text-green-600 dark:text-green-400"
                : "text-destructive"
            }`}
          >
            {testResult.success ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Connection successful — embeddings and chat both working.
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                {testResult.error}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
