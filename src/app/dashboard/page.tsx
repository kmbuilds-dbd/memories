import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { loadMemories } from "@/app/dashboard/timeline-actions";
import { Timeline } from "@/components/Timeline";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { memories, nextCursor } = await loadMemories();
  const hasMemories = memories.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Memories</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.email ? `, ${user.email}` : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/capture">
            <Plus className="mr-2 h-4 w-4" />
            Create Memory
          </Link>
        </Button>
      </div>

      {hasMemories ? (
        <Timeline initialMemories={memories} initialCursor={nextCursor} />
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No memories yet</CardTitle>
            <CardDescription>
              Start capturing moments that matter to you
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard/capture">
                <Plus className="mr-2 h-4 w-4" />
                Create Memory
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
