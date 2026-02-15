import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { MemoryDetailMedia } from "@/components/MemoryDetailMedia";
import { DeleteMemoryButton } from "@/components/DeleteMemoryButton";

interface MemoryDetailPageProps {
  params: Promise<{ memoryId: string }>;
}

export default async function MemoryDetailPage({ params }: MemoryDetailPageProps) {
  const { memoryId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: memory } = await supabase
    .from("memories")
    .select(
      "id, content, created_at, updated_at, memory_tags(tags(id, name)), media(id, type, storage_path, display_order)"
    )
    .eq("id", memoryId)
    .eq("user_id", user.id)
    .single();

  if (!memory) notFound();

  const tags =
    (memory.memory_tags as unknown as { tags: { id: string; name: string } }[])
      ?.map((mt) => mt.tags)
      .filter(Boolean) ?? [];

  const rawMedia = (
    (memory.media as { id: string; type: "photo" | "video"; storage_path: string; display_order: number }[]) ?? []
  ).sort((a, b) => a.display_order - b.display_order);

  // Generate signed URLs for private storage bucket
  let media = rawMedia.map((m) => ({ ...m, url: "" }));
  if (rawMedia.length > 0) {
    const paths = rawMedia.map((m) => m.storage_path);
    const { data: signed } = await supabase.storage
      .from("media")
      .createSignedUrls(paths, 3600);
    if (signed) {
      media = rawMedia.map((m, i) => ({
        ...m,
        url: signed[i]?.signedUrl || "",
      }));
    }
  }

  const createdDate = new Date(memory.created_at as string);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to memories
      </Link>

      <article className="space-y-6">
        {/* Date */}
        <div>
          <p className="text-sm text-muted-foreground">
            {createdDate.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {createdDate.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Content */}
        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {memory.content as string}
        </div>

        {/* Media */}
        {media.length > 0 && <MemoryDetailMedia media={media} />}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t pt-6">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/${memoryId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteMemoryButton memoryId={memoryId} />
        </div>
      </article>
    </main>
  );
}
