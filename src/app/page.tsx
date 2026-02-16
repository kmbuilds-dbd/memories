import Link from "next/link";
import { Box, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-inter)] w-full min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 pt-14 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 bg-foreground rounded-xl flex items-center justify-center">
            <Box className="w-6 h-6 text-background" />
          </div>
          <span className="font-extrabold tracking-tight text-4xl font-[family-name:var(--font-outfit)] bg-gradient-to-r from-violet-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
            Memories
          </span>
        </div>
        <Link
          href="/login"
          className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col px-6 pt-10 pb-28 no-scrollbar overflow-y-auto">
        {/* Hero */}
        <section className="animate-fade-in [animation-delay:0.1s]">
          <h1 className="font-[family-name:var(--font-outfit)] text-[40px] sm:text-5xl leading-[1.08] font-extrabold tracking-tight text-foreground mb-5">
            Your life is a story worth keeping.
          </h1>
          <p className="text-[16px] sm:text-lg leading-[1.6] text-muted-foreground max-w-xl">
            A minimalist time capsule for the moments that define you. Capture
            now, reflect later, and preserve what matters.
          </p>
        </section>

        {/* Visual Card */}
        <section className="mt-auto pt-10 animate-fade-in [animation-delay:0.2s]">
          <div className="max-w-sm mx-auto bg-muted/70 dark:bg-muted rounded-3xl border border-border/40 px-8 pt-16 pb-14 flex flex-col items-center text-center">
            <Sparkles className="w-8 h-8 text-foreground/15 mb-4" strokeWidth={1.5} />
            <h3 className="font-[family-name:var(--font-outfit)] text-lg font-bold mb-1.5 text-foreground">
              The Story-First App
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[220px]">
              Experience a distraction-free environment for your legacy.
            </p>
          </div>
        </section>

        {/* Philosophy Sections (below the fold) */}
        <section className="mt-20 mb-8 animate-fade-in [animation-delay:0.3s]">
          <div className="mb-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
              The Philosophy
            </h3>
            <div className="h-px w-8 bg-foreground" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted/70 dark:bg-muted rounded-2xl border border-border/40 p-6 space-y-2">
              <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold leading-tight">
                Preserve the Ephemeral
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Daily logs turn into a living history. Capture the feelings,
                sounds, and thoughts that usually fade away with time.
              </p>
            </div>

            <div className="bg-muted/70 dark:bg-muted rounded-2xl border border-border/40 p-6 space-y-2">
              <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold leading-tight">
                Future Deliveries
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Schedule messages and media to be delivered to your future self.
                Reflection is the ultimate tool for growth.
              </p>
            </div>

            <div className="bg-muted/70 dark:bg-muted rounded-2xl border border-border/40 p-6 space-y-2">
              <h2 className="font-[family-name:var(--font-outfit)] text-lg font-bold leading-tight">
                Pure Intent
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No social feeds, no likes, no distractions. Just you and your
                memories, stored securely and beautifully.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 pt-5 bg-gradient-to-t from-background via-background to-background/0 z-40 flex justify-center">
        <Link
          href="/signup"
          className="h-[54px] px-10 bg-foreground text-background rounded-2xl font-semibold text-[15px] inline-flex items-center gap-2 shadow-sm hover:scale-[0.98] transition-transform active:scale-95"
        >
          <span>Start Your Journey</span>
          <ArrowRight className="w-[18px] h-[18px]" />
        </Link>
      </div>
    </div>
  );
}
