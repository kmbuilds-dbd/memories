"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TagWithCount } from "@/types";

export async function fetchUserTagsWithCounts(): Promise<TagWithCount[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: tags } = await supabase
    .from("tags")
    .select("*, memory_tags(count)")
    .eq("user_id", user.id)
    .order("name");

  if (!tags) return [];

  return tags.map((tag) => {
    const countArr = tag.memory_tags as unknown as { count: number }[];
    return {
      id: tag.id,
      user_id: tag.user_id,
      name: tag.name,
      created_at: tag.created_at,
      memory_count: countArr?.[0]?.count ?? 0,
    };
  });
}

export async function renameTag(
  tagId: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = newName.trim();
  if (!trimmed) {
    return { success: false, error: "Tag name cannot be empty" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check uniqueness
  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", user.id)
    .ilike("name", trimmed)
    .neq("id", tagId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "A tag with that name already exists" };
  }

  const { error } = await supabase
    .from("tags")
    .update({ name: trimmed })
    .eq("id", tagId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tags");
  return { success: true };
}

export async function deleteTag(
  tagId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Delete memory_tags associations first
  await supabase.from("memory_tags").delete().eq("tag_id", tagId);

  // Delete the tag
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", tagId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tags");
  return { success: true };
}
