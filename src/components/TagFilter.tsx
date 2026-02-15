"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Tag } from "@/types";

interface TagFilterProps {
  tags: Tag[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTagId = searchParams.get("tag");

  if (tags.length === 0) return null;

  const toggleTag = (tagId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTagId === tagId) {
      params.delete("tag");
    } else {
      params.set("tag", tagId);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isActive = activeTagId === tag.id;
        return (
          <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}>
            <Badge variant={isActive ? "default" : "outline"} className="cursor-pointer">
              {tag.name}
              {isActive && <X className="ml-1 h-3 w-3" />}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
