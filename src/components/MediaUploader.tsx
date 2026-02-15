"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import type { StagedFile } from "@/types";
import {
  ACCEPTED_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILES,
  getFileType,
} from "@/lib/storage";

interface MediaUploaderProps {
  files: StagedFile[];
  onChange: (files: StagedFile[]) => void;
}

export function MediaUploader({ files, onChange }: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const remaining = MAX_FILES - files.length;
      if (remaining <= 0) return;

      const toAdd: StagedFile[] = [];
      const fileArray = Array.from(newFiles).slice(0, remaining);

      for (const file of fileArray) {
        const type = getFileType(file);
        if (!type) continue;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) continue;

        toAdd.push({
          id: crypto.randomUUID(),
          file,
          type,
          preview: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (toAdd.length > 0) {
        onChange([...files, ...toAdd]);
      }
    },
    [files, onChange]
  );

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) URL.revokeObjectURL(file.preview);
    onChange(files.filter((f) => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const statusIcon = (status: StagedFile["status"]) => {
    switch (status) {
      case "compressing":
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-white" />;
      case "done":
        return <Check className="h-4 w-4 text-green-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Photos & Videos</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Images & videos up to {MAX_FILE_SIZE_MB}MB ({files.length}/{MAX_FILES})
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          capture="environment"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {files.map((f) => (
            <div key={f.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
              {f.type === "photo" ? (
                <img
                  src={f.preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={f.preview}
                  className="h-full w-full object-cover"
                  muted
                />
              )}

              {/* Status overlay */}
              {f.status !== "pending" && f.status !== "done" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  {statusIcon(f.status)}
                </div>
              )}

              {/* Done checkmark */}
              {f.status === "done" && (
                <div className="absolute bottom-1 right-1">
                  {statusIcon(f.status)}
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(f.id);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
