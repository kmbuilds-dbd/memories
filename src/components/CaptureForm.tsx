"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/TagInput";
import { MediaUploader } from "@/components/MediaUploader";
import { X } from "lucide-react";
import { compressImage, uploadMediaFile } from "@/lib/storage";
import { createMemory } from "@/app/dashboard/capture/actions";
import { updateMemory } from "@/app/dashboard/capture/edit-actions";
import type { StagedFile, MediaFileInput, ExistingMedia } from "@/types";

interface CaptureFormProps {
  initialData?: {
    memoryId: string;
    content: string;
    tagNames: string[];
    existingMedia: ExistingMedia[];
  };
}

export function CaptureForm({ initialData }: CaptureFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [content, setContent] = useState(initialData?.content ?? "");
  const [tagNames, setTagNames] = useState<string[]>(initialData?.tagNames ?? []);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>(
    initialData?.existingMedia ?? []
  );
  const [deletedMediaIds, setDeletedMediaIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const removeExistingMedia = (mediaId: string) => {
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
    setDeletedMediaIds((prev) => [...prev, mediaId]);
  };

  const updateFile = (id: string, updates: Partial<StagedFile>) => {
    setStagedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() && stagedFiles.length === 0 && existingMedia.length === 0) {
      toast.error("Add some text or media to your memory");
      return;
    }

    setIsSaving(true);

    try {
      // Process and upload new files
      const mediaFiles: MediaFileInput[] = [];

      for (let i = 0; i < stagedFiles.length; i++) {
        const staged = stagedFiles[i];

        let fileToUpload = staged.file;

        // Compress images
        if (staged.type === "photo") {
          updateFile(staged.id, { status: "compressing" });
          try {
            fileToUpload = await compressImage(staged.file);
          } catch {
            // Use original if compression fails
          }
        }

        // Upload
        updateFile(staged.id, { status: "uploading" });
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) throw new Error("Not authenticated");

          const storagePath = await uploadMediaFile(
            user.id,
            fileToUpload,
            staged.type
          );

          updateFile(staged.id, { status: "done", storagePath });
          mediaFiles.push({
            storagePath,
            type: staged.type,
            displayOrder: existingMedia.length + i,
          });
        } catch (err) {
          updateFile(staged.id, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
          toast.error(`Failed to upload ${staged.file.name}`);
        }
      }

      if (isEditing) {
        const result = await updateMemory({
          memoryId: initialData.memoryId,
          content: content.trim(),
          tagNames,
          newMediaFiles: mediaFiles,
          deletedMediaIds,
        });

        if (result.success) {
          toast.success("Memory updated!");
          router.push(`/dashboard/${initialData.memoryId}`);
        } else {
          toast.error(result.error || "Failed to update memory");
        }
      } else {
        const result = await createMemory({
          content: content.trim(),
          tagNames,
          mediaFiles,
        });

        if (result.success) {
          toast.success("Memory saved!");
          router.push("/dashboard");
        } else {
          toast.error(result.error || "Failed to save memory");
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          What happened?
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What made this moment matter?"
          rows={6}
          className="resize-none font-body text-base leading-relaxed bg-card"
        />
      </div>

      {/* Existing media (edit mode) */}
      {existingMedia.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Media</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {existingMedia.map((m) => (
              <ExistingMediaThumb
                key={m.id}
                media={m}
                onRemove={() => removeExistingMedia(m.id)}
              />
            ))}
          </div>
        </div>
      )}

      <MediaUploader files={stagedFiles} onChange={setStagedFiles} />

      <TagInput tags={tagNames} onChange={setTagNames} />

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Update Memory"
              : "Save Memory"}
        </Button>
      </div>
    </div>
  );
}

function ExistingMediaThumb({
  media,
  onRemove,
}: {
  media: ExistingMedia;
  onRemove: () => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
      {media.type === "photo" ? (
        <img src={media.url} alt="" className="h-full w-full object-cover" />
      ) : (
        <video src={media.url} className="h-full w-full object-cover" muted />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5 text-white" />
      </button>
    </div>
  );
}
