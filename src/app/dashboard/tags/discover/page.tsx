import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAIConfigured } from "@/lib/ai/provider";
import { TagDiscovery } from "@/components/TagDiscovery";

export default async function TagDiscoverPage() {
  const aiEnabled = await isAIConfigured();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/tags"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to tags
      </Link>

      <h1 className="mb-8 font-display text-3xl">AI Tag Discovery</h1>

      <TagDiscovery aiEnabled={aiEnabled} />
    </main>
  );
}
