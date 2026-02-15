"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  Flame,
  Image as ImageIcon,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { UserStats } from "@/types";

interface StatsGridProps {
  stats: UserStats;
}

type NumericStatKey = "totalMemories" | "totalMedia" | "memoriesThisMonth" | "memoriesThisWeek" | "currentStreak" | "longestStreak" | "averagePerWeek";

const statCards: {
  key: NumericStatKey;
  label: string;
  icon: typeof BookOpen;
  suffix?: string;
}[] = [
  { key: "totalMemories", label: "Total Memories", icon: BookOpen },
  { key: "memoriesThisMonth", label: "This Month", icon: Calendar },
  { key: "memoriesThisWeek", label: "This Week", icon: TrendingUp },
  { key: "currentStreak", label: "Current Streak", icon: Flame, suffix: " days" },
  { key: "longestStreak", label: "Longest Streak", icon: Trophy, suffix: " days" },
  { key: "totalMedia", label: "Total Media", icon: ImageIcon },
];

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon, suffix }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats[key]}
                {suffix ?? ""}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.topTags.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Top Tags This Year
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.topTags.map((tag) => (
                <Badge key={tag.name} variant="secondary" className="text-sm">
                  {tag.name}{" "}
                  <span className="ml-1 text-muted-foreground">({tag.count})</span>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="text-sm text-muted-foreground">
        <p>
          Average <span className="font-medium text-foreground">{stats.averagePerWeek}</span> memories per week
        </p>
        {stats.firstMemoryDate && (
          <p className="mt-1">
            Since{" "}
            <span className="font-medium text-foreground">
              {new Date(stats.firstMemoryDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
