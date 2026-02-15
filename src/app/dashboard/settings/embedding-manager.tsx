"use client";

import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { backfillEmbeddings } from "@/app/dashboard/settings/actions";
import type { EmbeddingStatus } from "@/types";

interface EmbeddingManagerProps {
  initialStatus: EmbeddingStatus;
}

export function EmbeddingManager({ initialStatus }: EmbeddingManagerProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isRunning, setIsRunning] = useState(false);
  const [lastProcessed, setLastProcessed] = useState(0);

  const progress =
    status.totalMemories > 0
      ? Math.round((status.embeddedCount / status.totalMemories) * 100)
      : 0;

  const handleBackfill = useCallback(async () => {
    setIsRunning(true);
    setLastProcessed(0);

    let remaining = status.unembeddedCount;
    let totalProcessed = 0;

    while (remaining > 0) {
      const result = await backfillEmbeddings();
      if (result.processed === 0) break; // No progress, stop

      totalProcessed += result.processed;
      remaining = result.remaining;
      setLastProcessed(totalProcessed);
      setStatus((prev) => ({
        ...prev,
        embeddedCount: prev.totalMemories - remaining,
        unembeddedCount: remaining,
      }));
    }

    setIsRunning(false);
  }, [status.unembeddedCount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Features
        </CardTitle>
        <CardDescription>
          Generate embeddings for semantic search. Memories with embeddings can
          be searched by meaning, not just keywords.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              {status.embeddedCount} of {status.totalMemories} memories indexed
            </span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {status.unembeddedCount > 0 && (
          <Button
            onClick={handleBackfill}
            disabled={isRunning}
          >
            {isRunning
              ? `Processing... (${lastProcessed} done)`
              : `Generate Embeddings (${status.unembeddedCount} remaining)`}
          </Button>
        )}

        {status.unembeddedCount === 0 && status.totalMemories > 0 && (
          <p className="text-sm text-muted-foreground">
            All memories are indexed for semantic search.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
