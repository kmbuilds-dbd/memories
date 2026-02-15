import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-5 w-36" />
      <Skeleton className="mb-8 h-9 w-64" />

      {/* Summary card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-6">
            <div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="mt-1 h-4 w-16" />
            </div>
            <div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="mt-1 h-4 w-16" />
            </div>
          </div>
          <div className="mt-4 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Month sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-6">
          <Separator className="mb-4" />
          <div className="mb-3 flex items-baseline justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </main>
  );
}
