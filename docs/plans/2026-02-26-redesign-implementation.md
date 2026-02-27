# Warm Journal Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Memories app from default shadcn/ui appearance into a warm, intimate journal experience with custom typography, warm neutral palette, and intentional page-by-page design.

**Architecture:** Foundation-first cascade — design system layer (fonts, colors, texture) first, then page-by-page updates. Each task builds on the previous. No structural backend changes.

**Tech Stack:** Next.js 16, Tailwind CSS 4, shadcn/ui (re-themed), Google Fonts (Playfair Display, Lora, DM Sans)

**Note:** This project has no test suite. Verify each task with `npm run build`. Visual verification via dev server.

---

### Task 1: Replace Typography Foundation

**Files:**
- Modify: `src/app/layout.tsx` (lines 2, 7-25, 56)
- Modify: `src/app/globals.css` (lines 9-10)

**Step 1: Update font imports in layout.tsx**

Replace the four font imports (Geist, Geist_Mono, Inter, Outfit) with three new fonts:

```tsx
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lora, DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});
```

Update the body className to use the three new font variables:

```tsx
<body className={`${playfair.variable} ${lora.variable} ${dmSans.variable} antialiased`}>
```

**Step 2: Update CSS font variables in globals.css**

Replace lines 9-10 (the `--font-sans` and `--font-mono` theme entries):

```css
--font-sans: var(--font-dm-sans);
--font-mono: var(--font-dm-sans);
--font-display: var(--font-playfair);
--font-body: var(--font-lora);
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds. Some pages may look different due to font change (DM Sans becomes the default sans font).

**Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: replace fonts with Playfair Display, Lora, DM Sans"
```

---

### Task 2: Warm Color Palette — Light Mode

**Files:**
- Modify: `src/app/globals.css` (lines 50-83, the `:root` block)

**Step 1: Replace all :root CSS variables**

Replace the entire `:root` block (lines 50-83) with warm palette:

```css
:root {
  --radius: 0.625rem;
  --background: oklch(0.98 0.008 80);
  --foreground: oklch(0.22 0.02 65);
  --card: oklch(0.975 0.006 80);
  --card-foreground: oklch(0.22 0.02 65);
  --popover: oklch(0.975 0.006 80);
  --popover-foreground: oklch(0.22 0.02 65);
  --primary: oklch(0.55 0.1 60);
  --primary-foreground: oklch(0.98 0.005 80);
  --secondary: oklch(0.94 0.01 75);
  --secondary-foreground: oklch(0.22 0.02 65);
  --muted: oklch(0.935 0.012 75);
  --muted-foreground: oklch(0.55 0.03 65);
  --accent: oklch(0.94 0.015 75);
  --accent-foreground: oklch(0.22 0.02 65);
  --destructive: oklch(0.55 0.18 25);
  --border: oklch(0.91 0.015 75);
  --input: oklch(0.91 0.015 75);
  --ring: oklch(0.65 0.06 60);
  --chart-1: oklch(0.55 0.1 60);
  --chart-2: oklch(0.6 0.08 140);
  --chart-3: oklch(0.5 0.06 250);
  --chart-4: oklch(0.7 0.1 80);
  --chart-5: oklch(0.6 0.12 30);
  --sidebar: oklch(0.97 0.008 80);
  --sidebar-foreground: oklch(0.22 0.02 65);
  --sidebar-primary: oklch(0.55 0.1 60);
  --sidebar-primary-foreground: oklch(0.98 0.005 80);
  --sidebar-accent: oklch(0.94 0.01 75);
  --sidebar-accent-foreground: oklch(0.22 0.02 65);
  --sidebar-border: oklch(0.91 0.015 75);
  --sidebar-ring: oklch(0.65 0.06 60);
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: warm light mode palette — aged paper colors"
```

---

### Task 3: Warm Color Palette — Dark Mode

**Files:**
- Modify: `src/app/globals.css` (lines 85-117, the `.dark` block)

**Step 1: Replace all .dark CSS variables**

Replace the entire `.dark` block (lines 85-117):

```css
.dark {
  --background: oklch(0.18 0.015 65);
  --foreground: oklch(0.92 0.01 75);
  --card: oklch(0.22 0.015 65);
  --card-foreground: oklch(0.92 0.01 75);
  --popover: oklch(0.22 0.015 65);
  --popover-foreground: oklch(0.92 0.01 75);
  --primary: oklch(0.7 0.08 60);
  --primary-foreground: oklch(0.2 0.015 65);
  --secondary: oklch(0.26 0.015 65);
  --secondary-foreground: oklch(0.92 0.01 75);
  --muted: oklch(0.26 0.015 65);
  --muted-foreground: oklch(0.62 0.025 65);
  --accent: oklch(0.26 0.015 65);
  --accent-foreground: oklch(0.92 0.01 75);
  --destructive: oklch(0.7 0.19 22);
  --border: oklch(0.92 0.01 75 / 10%);
  --input: oklch(0.92 0.01 75 / 15%);
  --ring: oklch(0.55 0.04 60);
  --chart-1: oklch(0.7 0.08 60);
  --chart-2: oklch(0.65 0.07 140);
  --chart-3: oklch(0.6 0.06 250);
  --chart-4: oklch(0.75 0.1 80);
  --chart-5: oklch(0.65 0.12 30);
  --sidebar: oklch(0.22 0.015 65);
  --sidebar-foreground: oklch(0.92 0.01 75);
  --sidebar-primary: oklch(0.7 0.08 60);
  --sidebar-primary-foreground: oklch(0.92 0.01 75);
  --sidebar-accent: oklch(0.26 0.015 65);
  --sidebar-accent-foreground: oklch(0.92 0.01 75);
  --sidebar-border: oklch(0.92 0.01 75 / 10%);
  --sidebar-ring: oklch(0.55 0.04 60);
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: warm dark mode palette — candlelight colors"
```

---

### Task 4: Texture, Base Styles, and Utility Classes

**Files:**
- Modify: `src/app/globals.css` (lines 119-150)

**Step 1: Fix duplicate @layer base rules and add grain texture**

Replace @layer base (lines 119-128) and add new utilities after keyframes:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-dm-sans), system-ui, sans-serif;
  }
}
```

Add after the existing `.no-scrollbar` block (after line 150):

```css
/* Grain texture overlay */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* Typography utilities */
.font-display {
  font-family: var(--font-playfair), Georgia, serif;
}

.font-body {
  font-family: var(--font-lora), Georgia, serif;
}

.font-ui {
  font-family: var(--font-dm-sans), system-ui, sans-serif;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add grain texture overlay and font utility classes"
```

---

### Task 5: Landing Page Redesign

**Files:**
- Modify: `src/app/page.tsx` (full rewrite)

**Step 1: Rewrite the entire landing page**

Replace the full contents of `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="font-ui w-full min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 pt-10 px-6 sm:px-10 flex items-center justify-between max-w-3xl mx-auto w-full">
        <span className="font-display italic text-2xl text-foreground">
          Memories
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
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: redesign landing page — warm journal aesthetic"
```

---

### Task 6: Auth Pages

**Files:**
- Modify: `src/components/AuthForm.tsx` (lines 77-87 card header, line 118 button)
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/signup/page.tsx`

**Step 1: Add brand mark and warm styling to AuthForm**

In `src/components/AuthForm.tsx`, update the Card section (starting at line 77):

Replace the `<Card>` opening through `<CardHeader>` close (lines 77-87):

```tsx
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1">
        <p className="font-display italic text-xl text-center mb-2">Memories</p>
        <CardTitle className="text-xl font-semibold text-center">
          {mode === "login" ? "Welcome back" : "Create your journal"}
        </CardTitle>
        <CardDescription className="text-center font-body">
          {mode === "login"
            ? "Sign in to revisit your memories"
            : "Start capturing the moments that matter"}
        </CardDescription>
      </CardHeader>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/AuthForm.tsx
git commit -m "feat: warm auth form with brand mark and journal copy"
```

---

### Task 7: Navbar Redesign

**Files:**
- Modify: `src/components/Navbar.tsx` (lines 21-123)

**Step 1: Rewrite the Navbar component**

Replace the entire content of `src/components/Navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  Monitor,
  Calendar,
  BarChart3,
  Rewind,
  Clock,
  Settings,
} from "lucide-react";

const themeOrder = ["system", "light", "dark"] as const;

const navLinks = [
  { href: "/dashboard", label: "Timeline", icon: Clock },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/stats", label: "Insights", icon: BarChart3 },
  { href: "/dashboard/review", label: "Review", icon: Rewind },
] as const;

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const cycleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme as (typeof themeOrder)[number]);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <nav className="bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-display italic text-lg text-foreground">
              Memories
            </Link>
            {/* Desktop nav links */}
            <div className="hidden items-center gap-1 sm:flex">
              {navLinks.map(({ href, label }) => {
                const isActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/settings" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
              <ThemeIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
              Sign out
            </Button>
          </div>
        </div>
        {/* Mobile nav links */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:hidden no-scrollbar">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

Key changes: Brand in Playfair italic, no `border-b` (uses subtle bg instead), desktop nav is plain text links (no Button/icons), mobile keeps icons for compactness.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: warm navbar with Playfair brand, quieter navigation"
```

---

### Task 8: Dashboard Page — Simplified Header + FAB

**Files:**
- Modify: `src/app/dashboard/page.tsx` (lines 56-83 header section)

**Step 1: Simplify the dashboard header**

Replace the header section (lines 56-83, from `<div className="mb-8 flex...">` to the closing `</div>` of the buttons row):

```tsx
      <div className="mb-8">
        <h1 className="font-display text-3xl">Your Memories</h1>
        <p className="text-muted-foreground font-body mt-1">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </p>
      </div>
```

**Step 2: Add floating action button for create**

After the closing `</main>` tag (line 147), add a FAB:

```tsx
      {/* Floating create button */}
      <Link
        href="/dashboard/capture"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 sm:hidden"
        aria-label="Create memory"
      >
        <Plus className="h-6 w-6" />
      </Link>
      {/* Desktop create button (inline) */}
      <Link
        href="/dashboard/capture"
        className="hidden sm:inline-flex fixed bottom-8 right-8 z-50 h-12 px-6 rounded-xl bg-primary text-primary-foreground shadow-lg items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity active:scale-95"
      >
        <Plus className="h-4 w-4" />
        New Memory
      </Link>
```

Make sure `Link` and `Plus` are imported at the top of the file (Plus is already imported, Link is already imported).

**Step 3: Remove the Calendar/Tags buttons from header**

The Calendar and Tags links are already in the Navbar. Remove the Button imports for Calendar and Tags icons if they are no longer used elsewhere in the file. Keep the `Plus` import.

Remove these imports if now unused: `Calendar`, `Tags` from lucide-react (line 5). Keep `Plus`.

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: simplify dashboard header, add floating create button"
```

---

### Task 9: Memory Card — Warm Journal Style

**Files:**
- Modify: `src/components/MemoryCard.tsx` (full restyle)

**Step 1: Rewrite MemoryCard with warm styling**

Replace the entire content of `src/components/MemoryCard.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { MemoryPreview } from "@/types";

interface MemoryCardProps {
  memory: MemoryPreview;
  highlightQuery?: string;
  similarity?: number;
}

function highlightText(text: string, query?: string) {
  if (!query) return text;

  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (words.length === 0) return text;

  const regex = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function MemoryCard({ memory, highlightQuery, similarity }: MemoryCardProps) {
  const router = useRouter();
  const firstPhoto = memory.media.find((m) => m.type === "photo");
  const extraCount = memory.media.length - 1;
  const isEdited = memory.updated_at !== memory.created_at;

  return (
    <Link href={`/dashboard/${memory.id}`} className="block group">
      <div className="rounded-xl bg-card p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {firstPhoto && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={firstPhoto.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
              {extraCount > 0 && (
                <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-foreground/70 px-1 py-0.5 text-[10px] font-medium text-background">
                  +{extraCount}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="font-body line-clamp-3 text-sm leading-relaxed">
              {highlightText(memory.content, highlightQuery)}
            </p>
            {memory.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {memory.tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/dashboard?tag=${tag.id}`);
                    }}
                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hover:bg-accent transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {new Date(memory.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {isEdited && (
                  <span className="ml-1.5 italic opacity-70">edited</span>
                )}
              </span>
              {similarity != null && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {Math.round(similarity * 100)}% match
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

Key changes: Removed shadcn Card/Badge dependency, warm rounded-xl card with shadow-sm, font-body for content, custom warm tag pills, warm highlight color, softer date display.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/MemoryCard.tsx
git commit -m "feat: warm memory cards with Lora body text and custom tags"
```

---

### Task 10: Timeline — Date Separators and Warm Skeletons

**Files:**
- Modify: `src/components/Timeline.tsx` (lines 85-117)

**Step 1: Add date grouping and warm skeletons**

In `src/components/Timeline.tsx`, replace the memory card list and skeleton section (lines 84-117):

Replace the `<div className="space-y-4">` block and everything after it through the end-of-list message with:

```tsx
      {/* Memory list with date separators */}
      <div className="space-y-3">
        {memories.map((memory, index) => {
          const currentMonth = new Date(memory.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
          });
          const prevMonth = index > 0
            ? new Date(memories[index - 1].created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
              })
            : null;
          const showSeparator = index === 0 || currentMonth !== prevMonth;

          return (
            <div key={memory.id}>
              {showSeparator && (
                <p className="text-xs text-muted-foreground uppercase tracking-wider pt-4 pb-2 first:pt-0">
                  {currentMonth}
                </p>
              )}
              <MemoryCard memory={memory} highlightQuery={highlightQuery} />
            </div>
          );
        })}
      </div>

      {/* Loading skeletons */}
      {isLoadingMore && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card p-6 shadow-sm">
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-full rounded bg-muted animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-1/4 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} className="h-1" />

      {/* End of list */}
      {!cursor && memories.length > 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground font-body italic">
          The beginning of your story
        </p>
      )}
```

**Step 2: Remove Skeleton import**

The Skeleton component import from `@/components/ui/skeleton` (line 7) is no longer needed. Remove it.

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/Timeline.tsx
git commit -m "feat: add month date separators and warm loading skeletons"
```

---

### Task 11: Capture Form — Journal Writing Experience

**Files:**
- Modify: `src/app/dashboard/capture/page.tsx` (lines 6-11)
- Modify: `src/components/CaptureForm.tsx` (lines 147-159, 181-201)

**Step 1: Update capture page header**

In `src/app/dashboard/capture/page.tsx`, replace lines 6-11:

```tsx
      <div className="mb-8">
        <h1 className="font-display text-2xl">New Memory</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Capture a moment worth remembering
        </p>
      </div>
```

**Step 2: Update CaptureForm textarea and buttons**

In `src/components/CaptureForm.tsx`, replace the textarea section (lines 147-159):

```tsx
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          What happened?
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What made this moment matter?"
          rows={6}
          className="resize-none font-body text-base leading-relaxed bg-card"
        />
      </div>
```

Replace the button section (lines 181-201):

```tsx
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Update Memory"
              : "Save Memory"}
        </Button>
      </div>
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/dashboard/capture/page.tsx src/components/CaptureForm.tsx
git commit -m "feat: journal-style capture form with Lora textarea"
```

---

### Task 12: Memory Detail — Reading Experience

**Files:**
- Modify: `src/app/dashboard/[memoryId]/page.tsx` (lines 63-135)

**Step 1: Update the article layout for a journal reading experience**

Replace the `<main>` and `<article>` content (lines 63-135):

```tsx
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back
      </Link>

      <article className="space-y-8">
        {/* Date header — journal entry stamp */}
        <div>
          <p className="text-sm text-muted-foreground tracking-wide">
            {createdDate.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            <span className="ml-2 opacity-60">
              {createdDate.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </p>
          {updatedDate && (
            <p className="mt-1 text-xs italic text-muted-foreground opacity-60">
              Edited {updatedDate.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Content — the hero */}
        <div className="font-body text-lg leading-[1.8] whitespace-pre-wrap max-w-[65ch]">
          {memory.content as string}
        </div>

        {/* Media */}
        {media.length > 0 && <MemoryDetailMedia media={media} />}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/dashboard?tag=${tag.id}`}
                className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:bg-accent transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Actions — recessed */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/${memoryId}/edit`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <DeleteMemoryButton memoryId={memoryId} />
        </div>
      </article>
    </main>
```

Note: Remove the `Badge` import from line 5 since we no longer use it. Keep all other imports.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/dashboard/[memoryId]/page.tsx
git commit -m "feat: journal reading experience for memory detail"
```

---

### Task 13: Stats Page — Prose Instead of Cards

**Files:**
- Modify: `src/components/StatsGrid.tsx` (full rewrite)

**Step 1: Replace the grid with editorial prose**

Replace the entire content of `src/components/StatsGrid.tsx`:

```tsx
"use client";

import type { UserStats } from "@/types";

interface StatsGridProps {
  stats: UserStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const since = stats.firstMemoryDate
    ? new Date(stats.firstMemoryDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8 max-w-lg">
      {/* Main narrative */}
      <div className="font-body text-base leading-relaxed space-y-4">
        <p>
          You&apos;ve captured{" "}
          <span className="font-semibold text-foreground">{stats.totalMemories} memories</span>
          {since && (
            <>
              {" "}since{" "}
              <span className="font-semibold text-foreground">{since}</span>
            </>
          )}
          . That&apos;s about{" "}
          <span className="font-semibold text-foreground">{stats.averagePerWeek} per week</span>.
        </p>

        {stats.longestStreak > 0 && (
          <p>
            Your longest streak was{" "}
            <span className="font-semibold text-foreground">{stats.longestStreak} days</span>.
            {stats.currentStreak > 0 && (
              <>
                {" "}Right now you&apos;re on a{" "}
                <span className="font-semibold text-foreground">
                  {stats.currentStreak}-day streak
                </span>
                .
              </>
            )}
          </p>
        )}

        <p>
          This month:{" "}
          <span className="font-semibold text-foreground">{stats.memoriesThisMonth} memories</span>.
          {" "}This week:{" "}
          <span className="font-semibold text-foreground">{stats.memoriesThisWeek}</span>.
          {stats.totalMedia > 0 && (
            <>
              {" "}You&apos;ve attached{" "}
              <span className="font-semibold text-foreground">{stats.totalMedia} photos and videos</span>.
            </>
          )}
        </p>
      </div>

      {/* Top tags */}
      {stats.topTags.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Most used tags
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.map((tag) => (
              <span
                key={tag.name}
                className="text-sm px-3 py-1 rounded-full bg-secondary text-foreground"
              >
                {tag.name}
                <span className="ml-1.5 text-muted-foreground">{tag.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update stats page header**

In `src/app/dashboard/stats/page.tsx`, update the page title to use font-display (if there is an `<h1>`, change it to include `className="font-display text-3xl"`).

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/StatsGrid.tsx src/app/dashboard/stats/page.tsx
git commit -m "feat: replace stats grid with editorial prose"
```

---

### Task 14: Year Review — Warm Redesign

**Files:**
- Modify: `src/components/YearReview.tsx` (lines 49-75 summary card, lines 78-102 month sections)

**Step 1: Replace summary card with prose**

In `src/components/YearReview.tsx`, replace the summary Card (lines 49-75) with:

```tsx
      {/* Summary */}
      <div className="font-body text-base leading-relaxed">
        <p>
          In {data.year}, you captured{" "}
          <span className="font-semibold">{data.totalMemories} memories</span>
          {data.totalMedia > 0 && (
            <>
              {" "}with{" "}
              <span className="font-semibold">{data.totalMedia} photos and videos</span>
            </>
          )}
          .
        </p>
        {data.topTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.topTags.map((tag) => (
              <span key={tag.name} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        )}
      </div>
```

**Step 2: Update month section headers**

Replace the month heading (around line 82-85):

```tsx
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-lg">{month.monthName}</h3>
            <span className="text-xs text-muted-foreground">
              {month.memoryCount} {month.memoryCount === 1 ? "memory" : "memories"}
            </span>
          </div>
```

**Step 3: Remove Card, CardContent imports**

Remove the Card/CardContent imports since we no longer use them for the summary. Keep Badge import if still used, or remove if replaced by custom spans.

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/components/YearReview.tsx
git commit -m "feat: warm year review with prose summary"
```

---

### Task 15: Search Bar and Tag Discovery — Remove Sparkles

**Files:**
- Modify: `src/components/SearchBar.tsx` (line 106 — Sparkles icon)
- Modify: `src/components/TagDiscovery.tsx` (lines 80, 92 — Sparkles icons)

**Step 1: Replace Sparkles icon in SearchBar**

In `src/components/SearchBar.tsx`, replace the Sparkles import with a simple text indicator.

Replace the AI toggle button (lines 99-108):

```tsx
      {aiEnabled && (
        <Button
          variant={semantic ? "default" : "outline"}
          size="sm"
          onClick={toggleSemantic}
          title={semantic ? "Switch to keyword search" : "Switch to AI semantic search"}
          className="text-xs px-3"
        >
          AI
        </Button>
      )}
```

Remove `Sparkles` from the lucide-react import (line 7). Keep `Search` and `X`.

**Step 2: Replace Sparkles in TagDiscovery**

In `src/components/TagDiscovery.tsx`, remove `Sparkles` from the import (line 8). Keep `Check`, `Loader2`, `X`.

Replace the Sparkles icon references in the buttons (lines 80, 92) with no icon — just text:

```tsx
        <Button
          onClick={() => handleAnalyze("untagged")}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Analyze Untagged
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAnalyze("all")}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Analyze All
        </Button>
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/SearchBar.tsx src/components/TagDiscovery.tsx
git commit -m "feat: remove Sparkles icons, replace with text labels"
```

---

### Task 16: Remaining Pages — Apply Font Classes

**Files:**
- Modify: `src/app/dashboard/calendar/page.tsx` — add `font-display` to page title
- Modify: `src/app/dashboard/tags/page.tsx` — add `font-display` to page title
- Modify: `src/app/dashboard/tags/discover/page.tsx` — add `font-display` to page title
- Modify: `src/app/dashboard/review/page.tsx` — add `font-display` to page title
- Modify: `src/app/dashboard/settings/page.tsx` — add `font-display` to page title (line 27)
- Modify: `src/app/dashboard/[memoryId]/edit/page.tsx` — add `font-display` to page title

**Step 1: Add font-display class to all page titles**

For each file above, find the `<h1>` element and add `font-display` to its className. For example:

`className="text-3xl font-bold"` becomes `className="font-display text-3xl"`

Remove `font-bold` since Playfair Display carries its own weight for display use.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/app/dashboard/calendar/page.tsx src/app/dashboard/tags/page.tsx src/app/dashboard/tags/discover/page.tsx src/app/dashboard/review/page.tsx src/app/dashboard/settings/page.tsx src/app/dashboard/[memoryId]/edit/page.tsx
git commit -m "feat: apply Playfair Display to all page titles"
```

---

### Task 17: Final Build Verification

**Step 1: Full build check**

Run: `npm run build`
Expected: Build succeeds with zero errors.

**Step 2: Lint check**

Run: `npm run lint`
Expected: No new lint errors introduced.

**Step 3: Visual verification**

Run: `npm run dev`
Check each page visually:
- [ ] Landing page — warm cream, Playfair heading, journal preview, amber CTA
- [ ] Login/signup — brand mark, warm card
- [ ] Dashboard — Playfair title, month separators in timeline, warm cards, FAB
- [ ] Memory detail — Lora body at 18px, generous spacing
- [ ] Capture — Lora textarea, warm buttons
- [ ] Stats — prose format, no grid
- [ ] Calendar — amber dots
- [ ] Year review — prose summary, Playfair month headers
- [ ] Settings — warm theming
- [ ] Dark mode — warm browns, not pure black, amber accents

**Step 4: Final commit if any fixes needed**
