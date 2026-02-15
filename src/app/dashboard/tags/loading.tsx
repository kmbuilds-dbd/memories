export default function TagsLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-muted" />

      {/* Title */}
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-muted" />

      {/* Tag rows */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-5 w-12 animate-pulse rounded bg-muted" />
              <div className="h-5 w-8 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
