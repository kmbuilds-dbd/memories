import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="font-ui w-full min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 pt-10 px-6 sm:px-10 flex items-center justify-between max-w-3xl mx-auto w-full">
        <span className="font-display italic text-2xl text-foreground">
          Memorandom
        </span>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col px-6 sm:px-10 max-w-3xl mx-auto w-full">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.15] tracking-tight text-foreground mb-6">
            A quiet place for the moments that matter.
          </h1>
          <p className="font-body text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-lg">
            Capture what you feel, not just what you see. A private journal
            for the stories only you can tell.
          </p>
        </section>

        {/* Journal preview */}
        <section className="pb-16 animate-fade-in [animation-delay:0.15s]">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 max-w-md shadow-sm">
            <p className="text-xs text-muted-foreground mb-4 tracking-wide uppercase">
              Thursday, February 14
            </p>
            <p className="font-body text-base leading-relaxed text-foreground">
              Walked the long way home today through the park. The light
              through the trees felt like something I should hold onto.
              Called Mom on the way — she told me about the garden, about
              the new tomatoes.
            </p>
            <div className="flex gap-2 mt-5">
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                walks
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                family
              </span>
            </div>
          </div>
        </section>

        {/* Simple value props */}
        <section className="pb-24 animate-fade-in [animation-delay:0.3s]">
          <div className="space-y-3 text-muted-foreground font-body text-base leading-relaxed max-w-md">
            <p>No social feeds. No likes. No audience.</p>
            <p>Just you, your words, and the moments worth keeping.</p>
          </div>
        </section>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 pt-6 bg-gradient-to-t from-background via-background to-background/0 z-40 flex justify-center">
        <Link
          href="/signup"
          className="h-12 px-8 bg-primary text-primary-foreground rounded-xl font-medium text-sm inline-flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <span>Create your journal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
