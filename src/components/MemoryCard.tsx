"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import type { MemoryPreview } from "@/types";

interface MemoryCardProps {
  memory: MemoryPreview;
  highlightQuery?: string;
}

function highlightText(text: string, query?: string) {
  if (!query) return text;

  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return text;

  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function MemoryCard({ memory, highlightQuery }: MemoryCardProps) {
  const router = useRouter();
  const firstPhoto = memory.media.find((m) => m.type === "photo");
  const extraCount = memory.media.length - 1;
  const isEdited = memory.updated_at !== memory.created_at;

  return (
    <Link href={`/dashboard/${memory.id}`} className="block">
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Thumbnail */}
            {firstPhoto && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={firstPhoto.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
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
              <p className="line-clamp-3 text-sm">
                {highlightText(memory.content, highlightQuery)}
              </p>
              {memory.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {memory.tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/dashboard?tag=${tag.id}`);
                      }}
                    >
                      <Badge variant="secondary" className="cursor-pointer text-xs hover:bg-secondary/80">
                        {tag.name}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(memory.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {isEdited && (
                  <span className="ml-2 italic">Edited</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
