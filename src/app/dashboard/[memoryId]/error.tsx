"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemoryDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We couldn&apos;t load this memory. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to memories</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
