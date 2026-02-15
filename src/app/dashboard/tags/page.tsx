import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserTagsWithCounts } from "@/app/dashboard/tags/tag-management-actions";
import { TagList } from "@/components/TagList";

export default async function TagsPage() {
  const tags = await fetchUserTagsWithCounts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Tags</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/tags/discover">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Tag Suggestions
          </Link>
        </Button>
      </div>

      {tags.length > 0 ? (
        <TagList tags={tags} />
      ) : (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>No tags yet</CardTitle>
            <CardDescription>
              Tags will appear here when you add them to your memories
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
