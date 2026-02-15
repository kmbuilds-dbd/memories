import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaptureForm } from "@/components/CaptureForm";
import { fetchMemory } from "@/app/dashboard/capture/edit-actions";

interface EditMemoryPageProps {
  params: Promise<{ memoryId: string }>;
}

export default async function EditMemoryPage({ params }: EditMemoryPageProps) {
  const { memoryId } = await params;
  const memory = await fetchMemory(memoryId);

  if (!memory) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <CaptureForm
            initialData={{
              memoryId: memory.id,
              content: memory.content,
              tagNames: memory.tagNames,
              existingMedia: memory.media,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
