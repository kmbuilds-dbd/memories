"use server";

import { createClient } from "@/lib/supabase/server";
import type { CalendarMonth, MemoryPreview } from "@/types";

export async function loadCalendarMonth(
  year: number,
  month: number
): Promise<CalendarMonth> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { year, month, days: [] };
  }

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  // End date is the first day of the next month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase.rpc("get_calendar_days", {
    p_user_id: user.id,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error || !data) {
    return { year, month, days: [] };
  }

  const days = (data as { day: string; count: number }[]).map((d) => ({
    date: d.day,
    count: Number(d.count),
  }));

  return { year, month, days };
}

export async function loadMemoriesForDate(
  dateStr: string
): Promise<MemoryPreview[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  const startOfDay = `${dateStr}T00:00:00.000Z`;
  const endOfDay = `${dateStr}T23:59:59.999Z`;

  const { data: rows, error } = await supabase
    .from("memories")
    .select(
      "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path)"
    )
    .eq("user_id", user.id)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay)
    .order("created_at", { ascending: false });

  if (error || !rows) return [];

  // Collect all media paths for batch signing
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

  return parsedRows.map(({ row, tags, media }) => ({
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
}
