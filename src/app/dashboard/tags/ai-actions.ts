"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import type { TagDiscoveryResult } from "@/types";

export async function discoverTags(
  mode: "untagged" | "all"
): Promise<TagDiscoveryResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { suggestions: [], newTagIdeas: [] };
  }

  // Fetch memories
  let query = supabase
    .from("memories")
    .select("id, content, memory_tags(tags(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (mode === "untagged") {
    // Get memory IDs that have tags
    const { data: taggedIds } = await supabase
      .from("memory_tags")
      .select("memory_id")
      .limit(1000);
    const taggedSet = new Set(
      (taggedIds ?? []).map((r) => r.memory_id as string)
    );

    // We'll filter after fetch since Supabase doesn't easily support "has no join rows"
    const { data: rows } = await query;
    const untaggedRows = (rows ?? []).filter(
      (r) => !taggedSet.has(r.id as string)
    );

    if (untaggedRows.length === 0) {
      return { suggestions: [], newTagIdeas: [] };
    }

    return analyzeWithAI(supabase, user.id, untaggedRows);
  }

  const { data: rows } = await query;
  if (!rows || rows.length === 0) {
    return { suggestions: [], newTagIdeas: [] };
  }

  return analyzeWithAI(supabase, user.id, rows);
}

async function analyzeWithAI(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  rows: { id: unknown; content: unknown; memory_tags?: unknown }[]
): Promise<TagDiscoveryResult> {
  const provider = await getAIProvider();
  if (!provider) {
    return { suggestions: [], newTagIdeas: [] };
  }

  // Get existing tags for context
  const { data: existingTags } = await supabase
    .from("tags")
    .select("name")
    .eq("user_id", userId);

  const tagNames = (existingTags ?? []).map((t) => t.name as string);

  const memoriesForPrompt = rows.map((r) => ({
    id: r.id as string,
    content: (r.content as string).slice(0, 300),
  }));

  const content = await provider.chat.chatCompletion({
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that suggests tags for personal memories/journal entries.
The user has these existing tags: ${JSON.stringify(tagNames)}

Analyze each memory and suggest 1-3 relevant tags per memory. Prefer existing tags when they fit.
Also suggest up to 5 new tag ideas that would help organize these memories.

Respond in JSON with this exact structure:
{
  "suggestions": [
    {
      "memoryId": "uuid",
      "suggestedTags": ["tag1", "tag2"],
      "reasoning": "Brief explanation"
    }
  ],
  "newTagIdeas": [
    {
      "name": "tag-name",
      "description": "What this tag captures"
    }
  ]
}

Tag names should be lowercase, 1-3 words, and descriptive of themes, emotions, activities, or places.`,
      },
      {
        role: "user",
        content: `Analyze these memories and suggest tags:\n\n${JSON.stringify(memoriesForPrompt)}`,
      },
    ],
  });

  if (!content) {
    return { suggestions: [], newTagIdeas: [] };
  }

  const parsed = JSON.parse(content) as {
    suggestions?: {
      memoryId: string;
      suggestedTags: string[];
      reasoning: string;
    }[];
    newTagIdeas?: { name: string; description: string }[];
  };

  const suggestions = (parsed.suggestions ?? []).map((s) => {
    const memory = rows.find((r) => (r.id as string) === s.memoryId);
    return {
      memoryId: s.memoryId,
      memoryContentPreview: memory
        ? (memory.content as string).slice(0, 150)
        : "",
      suggestedTags: s.suggestedTags,
      reasoning: s.reasoning,
    };
  });

  return {
    suggestions,
    newTagIdeas: parsed.newTagIdeas ?? [],
  };
}

export async function applyTagSuggestion(
  memoryId: string,
  tagNames: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify memory ownership
  const { data: memory } = await supabase
    .from("memories")
    .select("id")
    .eq("id", memoryId)
    .eq("user_id", user.id)
    .single();

  if (!memory) {
    return { success: false, error: "Memory not found" };
  }

  for (const tagName of tagNames) {
    const trimmed = tagName.trim().toLowerCase();
    if (!trimmed) continue;

    // Find or create tag
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

    // Check if already linked
    const { data: existingLink } = await supabase
      .from("memory_tags")
      .select("memory_id")
      .eq("memory_id", memoryId)
      .eq("tag_id", tagId)
      .single();

    if (!existingLink) {
      await supabase
        .from("memory_tags")
        .insert({ memory_id: memoryId, tag_id: tagId });
    }
  }

  return { success: true };
}
