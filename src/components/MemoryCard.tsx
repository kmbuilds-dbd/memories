"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import type { MemoryPreview } from "@/types";

interface MemoryCardProps {
  memory: MemoryPreview;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const firstPhoto = memory.media.find((m) => m.type === "photo");
  const extraCount = memory.media.length - 1;

  return (
    <Link href={`/dashboard/${memory.id}`} className="block">
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Thumbnail */}
            {firstPhoto && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                <img
                  src={firstPhoto.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {extraCount > 0 && (
                  <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                    <ImageIcon className="h-2.5 w-2.5" />
                    +{extraCount}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-3 text-sm">{memory.content}</p>
              {memory.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {memory.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(memory.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
