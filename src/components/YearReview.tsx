"use client";

import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemoryCard } from "@/components/MemoryCard";
import type { YearInReview } from "@/types";

interface YearReviewProps {
  data: YearInReview;
}

export function YearReview({ data }: YearReviewProps) {
  const router = useRouter();

  const handleYearChange = (value: string) => {
    router.push(`/dashboard/review?year=${value}`);
  };

  return (
    <div className="space-y-8">
      {/* Year selector */}
      {data.availableYears.length > 1 && (
        <Select
          value={String(data.year)}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.availableYears.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Summary */}
      <div className="font-body text-base leading-relaxed">
        <p>
          In {data.year}, you captured{" "}
          <span className="font-semibold">{data.totalMemories} memories</span>
          {data.totalMedia > 0 && (
            <>
              {" "}with{" "}
              <span className="font-semibold">{data.totalMedia} photos and videos</span>
            </>
          )}
          .
        </p>
        {data.topTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.topTags.map((tag) => (
              <span key={tag.name} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Months */}
      {data.months.map((month) => (
        <div key={month.month}>
          <Separator className="mb-4" />
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-lg">{month.monthName}</h3>
            <span className="text-xs text-muted-foreground">
              {month.memoryCount} {month.memoryCount === 1 ? "memory" : "memories"}
            </span>
          </div>
          {month.memories.length > 0 ? (
            <div className="space-y-3">
              {month.memories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
              {month.memoryCount > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  +{month.memoryCount - 5} more
                </p>
              )}
            </div>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">No memories</p>
          )}
        </div>
      ))}
    </div>
  );
}
