"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Summary header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{data.totalMemories}</p>
              <p className="text-sm text-muted-foreground">Memories</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.totalMedia}</p>
              <p className="text-sm text-muted-foreground">Media</p>
            </div>
          </div>
          {data.topTags.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-muted-foreground">Top Tags</p>
              <div className="flex flex-wrap gap-1">
                {data.topTags.map((tag) => (
                  <Badge key={tag.name} variant="secondary" className="text-xs">
                    {tag.name} ({tag.count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Months */}
      {data.months.map((month) => (
        <div key={month.month}>
          <Separator className="mb-4" />
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">{month.monthName}</h3>
            <span className="text-sm text-muted-foreground">
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
