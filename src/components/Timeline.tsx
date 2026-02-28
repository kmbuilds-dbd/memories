"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "@/components/MemoryCard";
import { loadMemories } from "@/app/dashboard/timeline-actions";
import type { MemoryFilters, MemoryPreview } from "@/types";

interface TimelineProps {
  initialMemories: MemoryPreview[];
  initialCursor: string | null;
  filters?: MemoryFilters;
  highlightQuery?: string;
}

export function Timeline({ initialMemories, initialCursor, filters, highlightQuery }: TimelineProps) {
  const [memories, setMemories] = useState(initialMemories);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when server re-renders with new filters
  useEffect(() => {
    setMemories(initialMemories);
    setCursor(initialCursor);
  }, [initialMemories, initialCursor]);

  const fetchMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await loadMemories(cursor, filters);
      setMemories((prev) => [...prev, ...page.memories]);
      setCursor(page.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, filters]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor && !isLoadingMore) {
          fetchMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, isLoadingMore, fetchMore]);

  const handleRefresh = () => {
    startRefreshTransition(async () => {
      const page = await loadMemories(undefined, filters);
      setMemories(page.memories);
      setCursor(page.nextCursor);
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Memory list with date separators */}
      <div className="space-y-3">
        {memories.map((memory, index) => {
          const currentMonth = new Date(memory.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
          });
          const prevMonth = index > 0
            ? new Date(memories[index - 1].created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
              })
            : null;
          const showSeparator = index === 0 || currentMonth !== prevMonth;

          return (
            <div key={memory.id}>
              {showSeparator && (
                <p className="text-xs text-muted-foreground uppercase tracking-wider pt-4 pb-2 first:pt-0">
                  {currentMonth}
                </p>
              )}
              <MemoryCard memory={memory} highlightQuery={highlightQuery} />
            </div>
          );
        })}
      </div>

      {/* Loading skeletons */}
      {isLoadingMore && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-full rounded bg-muted animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-1/4 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} className="h-1" />

      {/* End of list */}
      {!cursor && memories.length > 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground font-body italic">
          The beginning of your story
        </p>
      )}
    </div>
  );
}
