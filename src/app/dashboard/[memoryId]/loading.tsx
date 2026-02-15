export default function MemoryDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-muted" />

      <div className="space-y-6">
        {/* Date */}
        <div className="space-y-1">
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>

        {/* Media grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="aspect-square animate-pulse rounded-lg bg-muted" />
          <div className="aspect-square animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </main>
  );
}
