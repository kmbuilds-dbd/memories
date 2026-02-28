"use client";

import type { UserStats } from "@/types";

interface StatsGridProps {
  stats: UserStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const since = stats.firstMemoryDate
    ? new Date(stats.firstMemoryDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8 max-w-lg">
      {/* Main narrative */}
      <div className="font-body text-base leading-relaxed space-y-4">
        <p>
          You&apos;ve captured{" "}
          <span className="font-semibold text-foreground">{stats.totalMemories} memories</span>
          {since && (
            <>
              {" "}since{" "}
              <span className="font-semibold text-foreground">{since}</span>
            </>
          )}
          . That&apos;s about{" "}
          <span className="font-semibold text-foreground">{stats.averagePerWeek} per week</span>.
        </p>

        {stats.longestStreak > 0 && (
          <p>
            Your longest streak was{" "}
            <span className="font-semibold text-foreground">{stats.longestStreak} days</span>.
            {stats.currentStreak > 0 && (
              <>
                {" "}Right now you&apos;re on a{" "}
                <span className="font-semibold text-foreground">
                  {stats.currentStreak}-day streak
                </span>
                .
              </>
            )}
          </p>
        )}

        <p>
          This month:{" "}
          <span className="font-semibold text-foreground">{stats.memoriesThisMonth} memories</span>.
          {" "}This week:{" "}
          <span className="font-semibold text-foreground">{stats.memoriesThisWeek}</span>.
          {stats.totalMedia > 0 && (
            <>
              {" "}You&apos;ve attached{" "}
              <span className="font-semibold text-foreground">{stats.totalMedia} photos and videos</span>.
            </>
          )}
        </p>
      </div>

      {/* Top tags */}
      {stats.topTags.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Most used tags
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map((tag) => (
              <span
                key={tag.name}
                className="text-sm px-3 py-1 rounded-full bg-secondary text-foreground"
              >
                {tag.name}
                <span className="ml-1.5 text-muted-foreground">{tag.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
