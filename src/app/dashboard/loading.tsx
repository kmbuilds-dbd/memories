import { Card, CardContent } from "@/components/ui/card";

function MemoryCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
          <div className="h-9 w-36 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>

      <div className="space-y-4">
        <MemoryCardSkeleton />
        <MemoryCardSkeleton />
        <MemoryCardSkeleton />
      </div>
    </main>
  );
}
