"use server";

import { createClient } from "@/lib/supabase/server";
import type { MemoryPreview, YearInReview, YearInReviewMonth } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function loadYearInReview(year: number): Promise<YearInReview> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      year,
      totalMemories: 0,
      totalMedia: 0,
      topTags: [],
      months: [],
      availableYears: [],
    };
  }

  const startOfYear = `${year}-01-01T00:00:00.000Z`;
  const endOfYear = `${year + 1}-01-01T00:00:00.000Z`;

  // Fetch all data in parallel
  const [memoriesRes, topTagsRes, availableYearsRes] =
    await Promise.all([
      supabase
        .from("memories")
        .select(
          "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path)"
        )
        .eq("user_id", user.id)
        .gte("created_at", startOfYear)
        .lt("created_at", endOfYear)
        .order("created_at", { ascending: false }),
      supabase.rpc("get_top_tags_for_year", {
        p_user_id: user.id,
        p_year: year,
      }),
      supabase.rpc("get_memory_years", { p_user_id: user.id }),
    ]);

  const rows = memoriesRes.data ?? [];

  // Sign all media URLs in one batch
  const allMedia: { path: string }[] = [];
  const parsedRows = rows.map((row) => {
    const tags =
      (row.memory_tags as unknown as { tags: { id: string; name: string } }[])
        ?.map((mt) => mt.tags)
        .filter(Boolean) ?? [];
    const media =
      (row.media as { id: string; type: "photo" | "video"; storage_path: string }[]) ?? [];
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

  // Group by month
  const monthGroups = new Map<number, MemoryPreview[]>();
  for (const memory of memories) {
    const m = new Date(memory.created_at).getMonth() + 1; // 1-12
    if (!monthGroups.has(m)) monthGroups.set(m, []);
    monthGroups.get(m)!.push(memory);
  }

  // Count total media across all fetched memories
  let totalMedia = 0;
  for (const memory of memories) {
    totalMedia += memory.media.length;
  }

  const months: YearInReviewMonth[] = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthMemories = monthGroups.get(monthNum) ?? [];
    return {
      month: monthNum,
      monthName: MONTH_NAMES[i],
      memoryCount: monthMemories.length,
      memories: monthMemories.slice(0, 5), // up to 5 highlights
    };
  });

  const topTags =
    ((topTagsRes.data as { name: string; count: number }[]) ?? []).slice(0, 10);

  const availableYears =
    ((availableYearsRes.data as { year: number }[]) ?? []).map((r) => r.year);

  return {
    year,
    totalMemories: memories.length,
    totalMedia,
    topTags,
    months,
    availableYears,
  };
}
