import { CaptureForm } from "@/components/CaptureForm";

export default function CapturePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl">New Memory</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Capture a moment worth remembering
        </p>
      </div>
      <CaptureForm />
    </main>
  );
}
