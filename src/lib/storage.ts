import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILES = 10;

export function getFileType(file: File): "photo" | "video" | null {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return "photo";
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return "video";
  return null;
}

export async function compressImage(file: File): Promise<File> {
  if (file.size <= 500 * 1024) return file;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  const compressed = await imageCompression(file, options);
  return compressed;
}

export async function uploadMediaFile(
  userId: string,
  file: File,
  type: "photo" | "video"
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || (type === "photo" ? "jpg" : "mp4");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

export function getPublicUrl(storagePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from("media").getPublicUrl(storagePath);
  return data.publicUrl;
}
