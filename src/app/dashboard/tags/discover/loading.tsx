import { Skeleton } from "@/components/ui/skeleton";

export default function TagDiscoverLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-5 w-24" />
      <Skeleton className="mb-8 h-9 w-48" />

      <div className="flex gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
    </main>
  );
}
