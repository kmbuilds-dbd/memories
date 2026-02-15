import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-5 w-36" />
      <Skeleton className="mb-8 h-9 w-32" />

      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-10" />
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="mx-auto h-4 w-8" />
        ))}
      </div>

      {/* Calendar grid: 5 weeks x 7 days */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    </main>
  );
}
