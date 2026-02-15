"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserStats } from "@/types";

export async function loadUserStats(): Promise<UserStats> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      totalMemories: 0,
      totalMedia: 0,
      memoriesThisMonth: 0,
      memoriesThisWeek: 0,
      currentStreak: 0,
      longestStreak: 0,
      topTags: [],
      firstMemoryDate: null,
      averagePerWeek: 0,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalMemoriesRes,
    totalMediaRes,
    thisMonthRes,
    thisWeekRes,
    topTagsRes,
    firstMemoryRes,
    streakRes,
  ] = await Promise.all([
    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth),
    supabase
      .from("memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfWeek.toISOString()),
    supabase.rpc("get_top_tags_for_year", {
      p_user_id: user.id,
      p_year: now.getFullYear(),
    }),
    supabase
      .from("memories")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1),
    supabase.rpc("get_user_streaks", { p_user_id: user.id }),
  ]);

  const totalMemories = totalMemoriesRes.count ?? 0;
  const totalMedia = totalMediaRes.count ?? 0;
  const memoriesThisMonth = thisMonthRes.count ?? 0;
  const memoriesThisWeek = thisWeekRes.count ?? 0;

  const topTags = ((topTagsRes.data as { name: string; count: number }[]) ?? []).slice(0, 5);

  const firstMemoryDate =
    firstMemoryRes.data && firstMemoryRes.data.length > 0
      ? (firstMemoryRes.data[0].created_at as string)
      : null;

  const streakData = streakRes.data as
    | { current_streak: number; longest_streak: number }[]
    | null;
  const currentStreak = streakData?.[0]?.current_streak ?? 0;
  const longestStreak = streakData?.[0]?.longest_streak ?? 0;

  // Calculate average per week
  let averagePerWeek = 0;
  if (firstMemoryDate && totalMemories > 0) {
    const firstDate = new Date(firstMemoryDate);
    const diffMs = now.getTime() - firstDate.getTime();
    const diffWeeks = Math.max(diffMs / (7 * 24 * 60 * 60 * 1000), 1);
    averagePerWeek = Math.round((totalMemories / diffWeeks) * 10) / 10;
  }

  return {
    totalMemories,
    totalMedia,
    memoriesThisMonth,
    memoriesThisWeek,
    currentStreak,
    longestStreak,
    topTags,
    firstMemoryDate,
    averagePerWeek,
  };
}
