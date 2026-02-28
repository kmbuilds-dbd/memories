import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { loadMemories } from "@/app/dashboard/timeline-actions";
import { semanticSearch } from "@/app/dashboard/search-actions";
import { fetchUserTags } from "@/app/dashboard/capture/tag-actions";
import { isAIConfigured } from "@/lib/ai/provider";
import { Timeline } from "@/components/Timeline";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { MemoryCard } from "@/components/MemoryCard";
import type { MemoryFilters } from "@/types";

interface DashboardPageProps {
  searchParams: Promise<{ q?: string; tag?: string; mode?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { q, tag, mode } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isSemantic = mode === "semantic" && !!q;

  const filters: MemoryFilters = {};
  if (q) filters.query = q;
  if (tag) filters.tagId = tag;
  const hasFilters = !!q || !!tag;

  // For semantic search, use the AI search path
  let semanticResults: Awaited<ReturnType<typeof semanticSearch>> | null = null;
  let memories: Awaited<ReturnType<typeof loadMemories>>["memories"] = [];
  let nextCursor: string | null = null;

  const [tags, aiEnabled] = await Promise.all([
    fetchUserTags(),
    isAIConfigured(),
  ]);

  if (isSemantic) {
    semanticResults = await semanticSearch(q);
  } else {
    const result = await loadMemories(undefined, filters);
    memories = result.memories;
    nextCursor = result.nextCursor;
  }

  const hasMemories = isSemantic
    ? (semanticResults?.length ?? 0) > 0
    : memories.length > 0;

  return (
    <>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl">Your Memories</h1>
        <p className="text-muted-foreground font-body mt-1">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <SearchBar aiEnabled={aiEnabled} />
        <TagFilter tags={tags} />
      </div>

      {hasMemories ? (
        isSemantic && semanticResults ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {semanticResults.length} semantic {semanticResults.length === 1 ? "match" : "matches"}
            </p>
            {semanticResults.map((result) => (
              <MemoryCard
                key={result.id}
                memory={result}
                similarity={result.similarity}
              />
            ))}
          </div>
        ) : (
          <Timeline
            initialMemories={memories}
            initialCursor={nextCursor}
            filters={filters}
            highlightQuery={q}
          />
        )
      ) : hasFilters ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No matching memories</CardTitle>
            <CardDescription>
              {isSemantic
                ? "No semantically similar memories found. Try a different query or ensure your memories have embeddings."
                : "Try adjusting your search or removing filters"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Clear filters</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No memories yet</CardTitle>
            <CardDescription>
              Start capturing moments that matter to you
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard/capture">
                <Plus className="mr-2 h-4 w-4" />
                Create Memory
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>

      {/* Floating create button */}
      <Link
        href="/dashboard/capture"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 sm:hidden"
        aria-label="Create memory"
      >
        <Plus className="h-6 w-6" />
      </Link>
      {/* Desktop create button (inline) */}
      <Link
        href="/dashboard/capture"
        className="hidden sm:inline-flex fixed bottom-8 right-8 z-50 h-12 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity active:scale-95"
      >
        <Plus className="h-4 w-4" />
        New Memory
      </Link>
    </>
  );
}
