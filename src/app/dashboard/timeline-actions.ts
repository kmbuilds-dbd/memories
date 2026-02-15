"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MemoryPage, MemoryPreview } from "@/types";

const PAGE_SIZE = 20;

export async function loadMemories(
  cursor?: string
): Promise<MemoryPage> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { memories: [], nextCursor: null };
  }

  let query = supabase
    .from("memories")
    .select(
      "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (cursor) {
    const [cursorDate, cursorId] = cursor.split("|");
    // Fetch rows older than cursor: same date with smaller id, or earlier date
    query = query.or(
      `created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`
    );
  }

  const { data: rows, error } = await query;

  if (error || !rows) {
    return { memories: [], nextCursor: null };
  }

  const hasMore = rows.length > PAGE_SIZE;
  const slice = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  // Collect all media storage paths for batch signing
  const allMedia: { rowIndex: number; mediaIndex: number; path: string }[] = [];
  const parsedRows = slice.map((row, rowIndex) => {
    const tags =
      (row.memory_tags as unknown as { tags: { id: string; name: string } }[])
        ?.map((mt) => mt.tags)
        .filter(Boolean) ?? [];

    const media =
      (row.media as { id: string; type: "photo" | "video"; storage_path: string }[]) ?? [];

    media.forEach((m, mediaIndex) => {
      allMedia.push({ rowIndex, mediaIndex, path: m.storage_path });
    });

    return { row, tags, media };
  });

  // Sign all URLs in one batch
  const signedUrlMap = new Map<string, string>();
  if (allMedia.length > 0) {
    const paths = allMedia.map((m) => m.path);
    const { data: signed } = await supabase.storage
      .from("media")
      .createSignedUrls(paths, 3600);
    if (signed) {
      signed.forEach((s, i) => {
        if (s.signedUrl) signedUrlMap.set(allMedia[i].path, s.signedUrl);
      });
    }
  }

  const memories: MemoryPreview[] = parsedRows.map(({ row, tags, media }) => ({
    id: row.id as string,
    content: row.content as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    tags,
    media: media.map((m) => ({
      ...m,
      url: signedUrlMap.get(m.storage_path) || "",
    })),
  }));

  let nextCursor: string | null = null;
  if (hasMore && memories.length > 0) {
    const last = memories[memories.length - 1];
    nextCursor = `${last.created_at}|${last.id}`;
  }

  return { memories, nextCursor };
}

export async function deleteMemory(
  memoryId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const { data: memory } = await supabase
    .from("memories")
    .select("id")
    .eq("id", memoryId)
    .eq("user_id", user.id)
    .single();

  if (!memory) {
    return { success: false, error: "Memory not found" };
  }

  // Get media storage paths before deletion
  const { data: mediaRows } = await supabase
    .from("media")
    .select("storage_path")
    .eq("memory_id", memoryId);

  const storagePaths = mediaRows?.map((m) => m.storage_path) ?? [];

  // Delete from storage
  if (storagePaths.length > 0) {
    await supabase.storage.from("media").remove(storagePaths);
  }

  // Delete memory_tags
  await supabase.from("memory_tags").delete().eq("memory_id", memoryId);

  // Delete media rows
  await supabase.from("media").delete().eq("memory_id", memoryId);

  // Delete the memory itself
  const { error: deleteError } = await supabase
    .from("memories")
    .delete()
    .eq("id", memoryId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
