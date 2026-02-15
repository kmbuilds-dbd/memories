"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateEmbedding } from "@/lib/openai";
import type {
  UpdateMemoryInput,
  CreateMemoryResult,
  ExistingMedia,
} from "@/types";

export async function fetchMemory(memoryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: memory } = await supabase
    .from("memories")
    .select(
      "id, content, created_at, memory_tags(tags(id, name)), media(id, type, storage_path)"
    )
    .eq("id", memoryId)
    .eq("user_id", user.id)
    .single();

  if (!memory) return null;

  const tags =
    (memory.memory_tags as unknown as { tags: { id: string; name: string } }[])
      ?.map((mt) => mt.tags)
      .filter(Boolean) ?? [];

  const rawMedia =
    (memory.media as { id: string; type: "photo" | "video"; storage_path: string }[]) ?? [];

  // Generate signed URLs for private storage bucket
  let media: ExistingMedia[] = rawMedia.map((m) => ({
    id: m.id,
    type: m.type,
    storagePath: m.storage_path,
    url: "",
  }));
  if (rawMedia.length > 0) {
    const paths = rawMedia.map((m) => m.storage_path);
    const { data: signed } = await supabase.storage
      .from("media")
      .createSignedUrls(paths, 3600);
    if (signed) {
      media = rawMedia.map((m, i) => ({
        id: m.id,
        type: m.type,
        storagePath: m.storage_path,
        url: signed[i]?.signedUrl || "",
      }));
    }
  }

  return {
    id: memory.id as string,
    content: memory.content as string,
    tagNames: tags.map((t) => t.name),
    media,
  };
}

export async function updateMemory(
  input: UpdateMemoryInput
): Promise<CreateMemoryResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("memories")
    .select("id")
    .eq("id", input.memoryId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { success: false, error: "Memory not found" };
  }

  const content = input.content.trim();
  if (!content) {
    return { success: false, error: "Content is required" };
  }

  // 1. Update memory content
  const { error: updateError } = await supabase
    .from("memories")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", input.memoryId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 2. Diff tags: get current tags, compute adds/removes
  const { data: currentTagLinks } = await supabase
    .from("memory_tags")
    .select("tag_id, tags(name)")
    .eq("memory_id", input.memoryId);

  const currentTagNames = new Set(
    (currentTagLinks ?? []).map(
      (link) => (link.tags as unknown as { name: string })?.name
    ).filter(Boolean)
  );

  const desiredTagNames = new Set(
    input.tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean)
  );

  // Remove tags no longer desired
  for (const link of currentTagLinks ?? []) {
    const name = (link.tags as unknown as { name: string })?.name;
    if (name && !desiredTagNames.has(name)) {
      await supabase
        .from("memory_tags")
        .delete()
        .eq("memory_id", input.memoryId)
        .eq("tag_id", link.tag_id);
    }
  }

  // Add new tags
  for (const tagName of desiredTagNames) {
    if (currentTagNames.has(tagName)) continue;

    // Find or create tag (same pattern as createMemory)
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", tagName)
      .single();

    let tagId: string;
    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag, error: tagError } = await supabase
        .from("tags")
        .insert({ user_id: user.id, name: tagName })
        .select("id")
        .single();

      if (tagError || !newTag) continue;
      tagId = newTag.id;
    }

    await supabase
      .from("memory_tags")
      .insert({ memory_id: input.memoryId, tag_id: tagId });
  }

  // 3. Delete removed media
  if (input.deletedMediaIds.length > 0) {
    // Get storage paths before deleting rows
    const { data: mediaToDelete } = await supabase
      .from("media")
      .select("storage_path")
      .in("id", input.deletedMediaIds)
      .eq("memory_id", input.memoryId);

    // Delete from storage
    if (mediaToDelete && mediaToDelete.length > 0) {
      const paths = mediaToDelete.map((m) => m.storage_path);
      await supabase.storage.from("media").remove(paths);
    }

    // Delete rows
    await supabase
      .from("media")
      .delete()
      .in("id", input.deletedMediaIds)
      .eq("memory_id", input.memoryId);
  }

  // 4. Insert new media
  for (const media of input.newMediaFiles) {
    await supabase.from("media").insert({
      memory_id: input.memoryId,
      user_id: user.id,
      type: media.type,
      storage_path: media.storagePath,
      display_order: media.displayOrder,
    });
  }

  // Re-generate embedding after content update
  try {
    const embedding = await generateEmbedding(content);
    await supabase
      .from("memories")
      .update({ embedding: JSON.stringify(embedding) })
      .eq("id", input.memoryId);
  } catch {
    // Embedding failure is non-critical
  }

  revalidatePath("/dashboard");
  return { success: true, memoryId: input.memoryId };
}
