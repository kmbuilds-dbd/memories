"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import type { SemanticSearchResult } from "@/types";

export async function semanticSearch(
  query: string
): Promise<SemanticSearchResult[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  // Generate embedding for the query
  const provider = await getAIProvider();
  if (!provider) return [];
  const queryEmbedding = await provider.embedding.generateEmbedding(query);

  // Call the match_memories RPC
  const { data: matches, error } = await supabase.rpc("match_memories", {
    p_user_id: user.id,
    p_embedding: JSON.stringify(queryEmbedding),
    p_match_threshold: 0.3,
    p_match_count: 20,
  });

  if (error || !matches || matches.length === 0) return [];

  const matchedIds = (matches as { id: string; similarity: number }[]).map(
    (m) => m.id
  );
  const similarityMap = new Map(
    (matches as { id: string; similarity: number }[]).map((m) => [
      m.id,
      m.similarity,
    ])
  );

  // Hydrate with tags and media
  const { data: rows } = await supabase
    .from("memories")
    .select(
      "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path)"
    )
    .in("id", matchedIds);

  if (!rows) return [];

  // Sign media URLs
  const allMedia: { path: string }[] = [];
  const parsedRows = rows.map((row) => {
    const tags =
      (row.memory_tags as unknown as { tags: { id: string; name: string } }[])
        ?.map((mt) => mt.tags)
        .filter(Boolean) ?? [];
    const media =
      (row.media as { id: string; type: "photo" | "video"; storage_path: string }[]) ??
      [];
    media.forEach((m) => allMedia.push({ path: m.storage_path }));
    return { row, tags, media };
  });

  const signedUrlMap = new Map<string, string>();
  if (allMedia.length > 0) {
    const paths = allMedia.map((m) => m.path);
    const { data: signed } = await supabase.storage
      .from("media")
      .createSignedUrls(paths, 3600);
    if (signed) {
      signed.forEach((s, i) => {
        if (s.signedUrl) signedUrlMap.set(paths[i], s.signedUrl);
      });
    }
  }

  const results: SemanticSearchResult[] = parsedRows.map(
    ({ row, tags, media }) => ({
      id: row.id as string,
      content: row.content as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      tags,
      media: media.map((m) => ({
        ...m,
        url: signedUrlMap.get(m.storage_path) || "",
      })),
      similarity: similarityMap.get(row.id as string) ?? 0,
    })
  );

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  return results;
}
