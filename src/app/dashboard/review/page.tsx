import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadYearInReview } from "@/app/dashboard/review/actions";
import { YearReview } from "@/components/YearReview";

interface ReviewPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const year = params.year
    ? parseInt(params.year, 10)
    : new Date().getFullYear();

  const data = await loadYearInReview(year);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <h1 className="mb-8 text-3xl font-bold">Year in Review — {year}</h1>

      <YearReview data={data} />
    </main>
  );
}
