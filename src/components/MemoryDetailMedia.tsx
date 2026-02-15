"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { MediaLightbox } from "@/components/MediaLightbox";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  storage_path: string;
}

interface MemoryDetailMediaProps {
  media: MediaItem[];
}

export function MemoryDetailMedia({ media }: MemoryDetailMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const lightboxItems = media.map((m) => ({
    type: m.type,
    url: `${supabaseUrl}/storage/v1/object/public/media/${m.storage_path}`,
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
        {media.map((m, i) => {
          const url = `${supabaseUrl}/storage/v1/object/public/media/${m.storage_path}`;

          return (
            <button
              key={m.id}
              onClick={() => {
                setLightboxIndex(i);
                setLightboxOpen(true);
              }}
              className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
            >
              {m.type === "photo" ? (
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <>
                  <video
                    src={url}
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
          );
        })}
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
