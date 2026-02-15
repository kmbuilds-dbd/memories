"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaItem {
  type: "photo" | "video";
  url: string;
}

interface MediaLightboxProps {
  items: MediaItem[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaLightbox({
  items,
  initialIndex,
  open,
  onOpenChange,
}: MediaLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, goNext, goPrev]);

  if (items.length === 0) return null;
  const current = items[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] border-0 bg-black/95 p-0 sm:max-w-[90vw]">
        <div className="relative flex h-[85vh] items-center justify-center">
          {current.type === "photo" ? (
            <img
              src={current.url}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <video
              src={current.url}
              controls
              autoPlay
              className="max-h-full max-w-full"
            />
          )}

          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Counter */}
          {items.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {index + 1} / {items.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
