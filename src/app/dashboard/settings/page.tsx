import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEmbeddingStatus } from "@/app/dashboard/settings/actions";
import { EmbeddingManager } from "./embedding-manager";

export default async function SettingsPage() {
  const status = await getEmbeddingStatus();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <EmbeddingManager initialStatus={status} />
    </main>
  );
}
