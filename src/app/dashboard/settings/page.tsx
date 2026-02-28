import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEmbeddingStatus, getAISettings } from "@/app/dashboard/settings/actions";
import { isAIConfigured } from "@/lib/ai/provider";
import { EmbeddingManager } from "./embedding-manager";
import { AIProviderSettings } from "./ai-provider-settings";

export default async function SettingsPage() {
  const [status, aiSettings, aiConfigured] = await Promise.all([
    getEmbeddingStatus(),
    getAISettings(),
    isAIConfigured(),
  ]);

  const hasServerKey = !!process.env.OPENAI_API_KEY;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <h1 className="mb-8 font-display text-3xl">Settings</h1>

      <div className="space-y-6">
        <AIProviderSettings
          initialSettings={aiSettings}
          hasServerKey={hasServerKey}
        />
        <EmbeddingManager initialStatus={status} aiConfigured={aiConfigured} />
      </div>
    </main>
  );
}
