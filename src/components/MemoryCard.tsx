"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { MemoryPreview } from "@/types";

interface MemoryCardProps {
  memory: MemoryPreview;
  highlightQuery?: string;
  similarity?: number;
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
      <mark key={i} className="bg-primary/20 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function MemoryCard({ memory, highlightQuery, similarity }: MemoryCardProps) {
  const router = useRouter();
  const firstPhoto = memory.media.find((m) => m.type === "photo");
  const extraCount = memory.media.length - 1;
  const isEdited = memory.updated_at !== memory.created_at;

  return (
    <Link href={`/dashboard/${memory.id}`} className="block group">
      <div className="rounded-xl bg-card p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {firstPhoto && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={firstPhoto.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
              {extraCount > 0 && (
                <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-foreground/70 px-1 py-0.5 text-[10px] font-medium text-background">
                  +{extraCount}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="font-body line-clamp-3 text-sm leading-relaxed">
              {highlightText(memory.content, highlightQuery)}
            </p>
            {memory.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {memory.tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/dashboard?tag=${tag.id}`);
                    }}
                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {new Date(memory.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {isEdited && (
                  <span className="ml-1.5 italic opacity-70">edited</span>
                )}
              </span>
              {similarity != null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {Math.round(similarity * 100)}% match
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
