import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadUserStats } from "@/app/dashboard/stats/actions";
import { StatsGrid } from "@/components/StatsGrid";

export default async function StatsPage() {
  const stats = await loadUserStats();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <h1 className="mb-8 font-display text-3xl">Insights</h1>

      <StatsGrid stats={stats} />
    </main>
  );
}
