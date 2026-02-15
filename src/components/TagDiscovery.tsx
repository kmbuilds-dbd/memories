"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  discoverTags,
  applyTagSuggestion,
} from "@/app/dashboard/tags/ai-actions";
import type { TagDiscoveryResult, TagSuggestion } from "@/types";

export function TagDiscovery() {
  const [result, setResult] = useState<TagDiscoveryResult | null>(null);
  const [isAnalyzing, startAnalysis] = useTransition();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleAnalyze = (mode: "untagged" | "all") => {
    startAnalysis(async () => {
      const data = await discoverTags(mode);
      setResult(data);
      setDismissedIds(new Set());
      setAppliedIds(new Set());
    });
  };

  const handleAccept = async (suggestion: TagSuggestion) => {
    setApplyingId(suggestion.memoryId);
    const res = await applyTagSuggestion(
      suggestion.memoryId,
      suggestion.suggestedTags
    );
    if (res.success) {
      setAppliedIds((prev) => new Set(prev).add(suggestion.memoryId));
      toast.success("Tags applied successfully");
    } else {
      toast.error(res.error ?? "Failed to apply tags");
    }
    setApplyingId(null);
  };

  const handleDismiss = (memoryId: string) => {
    setDismissedIds((prev) => new Set(prev).add(memoryId));
  };

  const visibleSuggestions = result?.suggestions.filter(
    (s) => !dismissedIds.has(s.memoryId) && !appliedIds.has(s.memoryId)
  );

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleAnalyze("untagged")}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze Untagged
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAnalyze("all")}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze All
        </Button>
      </div>

      {isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Analyzing memories with AI... This may take a moment.
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {result && !isAnalyzing && (
        <>
          {visibleSuggestions && visibleSuggestions.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Suggestions ({visibleSuggestions.length})
              </h3>
              {visibleSuggestions.map((suggestion) => (
                <Card key={suggestion.memoryId}>
                  <CardContent className="pt-4">
                    <p className="line-clamp-2 text-sm">
                      {suggestion.memoryContentPreview}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {suggestion.suggestedTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {suggestion.reasoning}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(suggestion)}
                        disabled={applyingId === suggestion.memoryId}
                      >
                        {applyingId === suggestion.memoryId ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="mr-1 h-3 w-3" />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(suggestion.memoryId)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {result.suggestions.length === 0
                  ? "No suggestions available. Try analyzing all memories."
                  : "All suggestions have been handled."}
              </CardContent>
            </Card>
          )}

          {/* New tag ideas */}
          {result.newTagIdeas.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  New Tag Ideas
                </h3>
                <div className="space-y-2">
                  {result.newTagIdeas.map((idea) => (
                    <div key={idea.name} className="flex items-start gap-2">
                      <Badge variant="outline">{idea.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {idea.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Applied count */}
          {appliedIds.size > 0 && (
            <p className="text-sm text-muted-foreground">
              {appliedIds.size} suggestion{appliedIds.size !== 1 ? "s" : ""} applied
            </p>
          )}
        </>
      )}
    </div>
  );
}
