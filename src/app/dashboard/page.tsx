import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memories } = await supabase
    .from("memories")
    .select("id, content, created_at, memory_tags(tags(id, name))")
    .order("created_at", { ascending: false });

  const hasMemories = memories && memories.length > 0;

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
        <div className="space-y-4">
          {memories.map((memory) => {
            const tags = (memory.memory_tags as unknown as { tags: { id: string; name: string } }[])
              ?.map((mt) => mt.tags)
              .filter(Boolean) ?? [];

            return (
              <Card key={memory.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-3">{memory.content}</p>
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(memory.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="shrink-0">
                      <Link href={`/dashboard/${memory.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit memory</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
