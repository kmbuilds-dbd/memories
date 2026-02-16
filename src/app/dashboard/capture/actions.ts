"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateEmbeddingForUser } from "@/lib/ai/provider";
import type { CreateMemoryInput, CreateMemoryResult } from "@/types";

export async function createMemory(
  input: CreateMemoryInput
): Promise<CreateMemoryResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const content = input.content.trim();
  if (!content) {
    return { success: false, error: "Content is required" };
  }

  // Insert memory
  const { data: memory, error: memoryError } = await supabase
    .from("memories")
    .insert({ user_id: user.id, content })
    .select("id")
    .single();

  if (memoryError || !memory) {
    return { success: false, error: memoryError?.message || "Failed to create memory" };
  }

  // Handle tags
  for (const tagName of input.tagNames) {
    const trimmed = tagName.trim().toLowerCase();
    if (!trimmed) continue;

    // Find existing tag or create new one
    const { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", trimmed)
      .single();

    let tagId: string;

    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag, error: tagError } = await supabase
        .from("tags")
        .insert({ user_id: user.id, name: trimmed })
        .select("id")
        .single();

      if (tagError || !newTag) continue;
      tagId = newTag.id;
    }

    // Link tag to memory
    await supabase
      .from("memory_tags")
      .insert({ memory_id: memory.id, tag_id: tagId });
  }

  // Handle media
  for (const media of input.mediaFiles) {
    await supabase.from("media").insert({
      memory_id: memory.id,
      user_id: user.id,
      type: media.type,
      storage_path: media.storagePath,
      display_order: media.displayOrder,
    });
  }

  // Generate embedding (non-blocking — failure must not block memory creation)
  try {
    const embedding = await generateEmbeddingForUser(content);
    if (embedding) {
      await supabase
        .from("memories")
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", memory.id);
    }
  } catch {
    // Embedding failure is non-critical
  }

  revalidatePath("/dashboard");
  return { success: true, memoryId: memory.id };
}
