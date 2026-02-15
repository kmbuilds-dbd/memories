import { CaptureForm } from "@/components/CaptureForm";

export default function CapturePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Memory</h1>
        <p className="text-sm text-muted-foreground">
          Capture a moment worth remembering
        </p>
      </div>
      <CaptureForm />
    </main>
  );
}
