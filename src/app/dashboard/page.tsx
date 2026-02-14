import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Memories</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <CardTitle>No memories yet</CardTitle>
          <CardDescription>
            Start capturing moments that matter to you
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button disabled>
            Create Memory (Coming in Phase 2)
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
