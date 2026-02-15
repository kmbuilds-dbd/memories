"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { MediaLightbox } from "@/components/MediaLightbox";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
}

interface MemoryDetailMediaProps {
  media: MediaItem[];
}

export function MemoryDetailMedia({ media }: MemoryDetailMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxItems = media.map((m) => ({
    type: m.type,
    url: m.url,
  }));

  const gridCols =
    media.length === 1
      ? "grid-cols-1"
      : media.length === 2
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3";

  return (
    <>
      <div className={`grid gap-2 ${gridCols}`}>
        {media.map((m, i) => (
          <button
            key={m.id}
            onClick={() => {
              setLightboxIndex(i);
              setLightboxOpen(true);
            }}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
          >
            {m.type === "photo" ? (
              <Image
                src={m.url}
                alt=""
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <>
                <video
                  src={m.url}
                  className="h-full w-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/60 p-3">
                    <Play className="h-6 w-6 text-white" fill="white" />
                  </div>
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      <MediaLightbox
        items={lightboxItems}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
}
