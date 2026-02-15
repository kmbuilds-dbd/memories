"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tag } from "@/types";

export async function fetchUserTags(): Promise<Tag[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return tags || [];
}
