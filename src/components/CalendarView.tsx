"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MemoryCard } from "@/components/MemoryCard";
import { loadMemoriesForDate } from "@/app/dashboard/calendar/actions";
import type { CalendarMonth, MemoryPreview } from "@/types";

interface CalendarViewProps {
  initialData: CalendarMonth;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarView({ initialData }: CalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayMemories, setDayMemories] = useState<MemoryPreview[]>([]);
  const [isLoadingDay, startDayTransition] = useTransition();

  const { year, month, days } = initialData;

  const countByDate = new Map(days.map((d) => [d.date, d.count]));

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const navigateMonth = useCallback(
    (direction: -1 | 1) => {
      let newMonth = month + direction;
      let newYear = year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
      setSelectedDate(null);
      setDayMemories([]);
      router.push(`/dashboard/calendar?year=${newYear}&month=${newMonth}`);
    },
    [router, year, month]
  );

  const handleDayClick = useCallback(
    (day: number) => {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (selectedDate === dateStr) {
        setSelectedDate(null);
        setDayMemories([]);
        return;
      }
      setSelectedDate(dateStr);
      startDayTransition(async () => {
        const memories = await loadMemoriesForDate(dateStr);
        setDayMemories(memories);
      });
    },
    [year, month, selectedDate]
  );

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {name}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const count = countByDate.get(dateStr) ?? 0;
          const isToday = isCurrentMonth && today.getDate() === day;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`relative aspect-square rounded-md text-sm transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                    ? "bg-accent font-bold"
                    : count > 0
                      ? "hover:bg-accent"
                      : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              {day}
              {count > 0 && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary" />
              )}
              {count > 0 && isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day memories */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {isLoadingDay ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Loading memories...
              </CardContent>
            </Card>
          ) : dayMemories.length > 0 ? (
            <div className="space-y-3">
              {dayMemories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No memories on this day
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
