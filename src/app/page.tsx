import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Memories
        </h1>
        <p className="text-lg text-muted-foreground">
          Your personal time capsule. Capture, organize, and rediscover the
          moments that matter most.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
