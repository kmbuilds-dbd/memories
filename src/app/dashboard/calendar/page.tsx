import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadCalendarMonth } from "@/app/dashboard/calendar/actions";
import { CalendarView } from "@/components/CalendarView";

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;

  const data = await loadCalendarMonth(year, month);

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <h1 className="mb-8 font-display text-3xl">Calendar</h1>

      <CalendarView initialData={data} />
    </main>
  );
}
