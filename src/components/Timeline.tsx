"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoryCard } from "@/components/MemoryCard";
import { loadMemories } from "@/app/dashboard/timeline-actions";
import type { MemoryPreview } from "@/types";

interface TimelineProps {
  initialMemories: MemoryPreview[];
  initialCursor: string | null;
}

export function Timeline({ initialMemories, initialCursor }: TimelineProps) {
  const [memories, setMemories] = useState(initialMemories);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await loadMemories(cursor);
      setMemories((prev) => [...prev, ...page.memories]);
      setCursor(page.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore]);

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
      const page = await loadMemories();
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

      <div className="space-y-4">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>

      {/* Loading skeletons */}
      {isLoadingMore && (
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
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
        <p className="py-8 text-center text-sm text-muted-foreground">
          Beginning of your memories
        </p>
      )}
    </div>
  );
}
