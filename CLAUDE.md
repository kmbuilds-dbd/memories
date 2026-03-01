# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Memories is a personal time capsule PWA — capture, organize, and rediscover moments. Private, no social features. Designed for two moments: fast frictionless capture and emotionally rich rediscovery.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build — run this to verify changes compile
npm run start        # Production server (binds 0.0.0.0:$PORT for Railway)
npm run lint         # ESLint
```

No test suite exists yet.

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript 5)
- **Tailwind CSS 4** + shadcn/ui + Radix UI
- **Supabase** — PostgreSQL, Auth (email + Google + Apple), Storage (S3-compatible)
- **AI** — OpenAI API or Ollama (optional, user-configured BYOK)
- **PWA** via next-pwa, deployed on **Railway**

## Architecture

### Route Structure

All authenticated pages live under `/dashboard` (protected by middleware). The landing page, `/login`, and `/signup` are public.

```
src/app/
├── page.tsx                    # Landing page (custom fonts: Inter + Outfit)
├── login/ & signup/            # Auth pages using AuthForm component
├── auth/callback/route.ts      # OAuth code exchange → redirect
└── dashboard/                  # Protected — requires auth
    ├── page.tsx                # Timeline (infinite scroll, cursor pagination)
    ├── capture/                # Create memory
    ├── [memoryId]/             # Detail view + /edit
    ├── calendar/               # Calendar view
    ├── stats/                  # User statistics
    ├── review/                 # Year in Review
    ├── tags/ + tags/discover/  # Tag management + AI suggestions
    └── settings/               # AI provider config, embeddings
```

### Server Actions Pattern

Data mutations use **co-located server actions** (`actions.ts` files inside route folders). Each action creates a Supabase server client, performs the operation, and calls `revalidatePath()`. Client components call these actions directly.

Key action files:
- `dashboard/capture/actions.ts` — createMemory
- `dashboard/capture/edit-actions.ts` — updateMemory, fetchMemory
- `dashboard/timeline-actions.ts` — loadMemories (cursor-paginated), deleteMemory
- `dashboard/search-actions.ts` — semanticSearch
- `dashboard/tags/ai-actions.ts` — AI tag suggestions

### Supabase Auth Flow

```
Request → middleware.ts → lib/supabase/middleware.ts (updateSession)
  ├── Refreshes session cookies
  ├── /dashboard/* without auth → redirect /login
  └── /login or /signup with auth → redirect /dashboard
```

Two Supabase clients:
- `lib/supabase/client.ts` — browser client (`createBrowserClient`) for "use client" components
- `lib/supabase/server.ts` — server client (`createServerClient`) for server actions/components

The OAuth callback at `/auth/callback` reads `x-forwarded-host` headers to build the redirect URL correctly behind Railway's proxy.

### AI Provider Abstraction

`lib/ai/` contains a provider factory pattern:
- `provider.ts` — `getAIProvider()` returns OpenAI or Ollama based on user settings
- AI is fully optional — the app degrades gracefully without it
- Embeddings stored in `embedding` column, searched via `match_memories` RPC
- Users configure their own API keys in `/dashboard/settings` (BYOK model)

### Media Upload Flow

Client-side: compress images via `browser-image-compression` → upload to Supabase Storage → store path in `media` table. Files go to `media` bucket at path `${userId}/${uuid}.${ext}`. Server generates 1-hour signed URLs for display.

## Database Tables

All tables use RLS — users can only access their own data.

- `memories` — id, user_id, content, created_at (immutable), updated_at, search_vector, embedding
- `media` — id, memory_id, user_id, type (photo/video), storage_path, thumbnail_path, display_order
- `tags` — id, user_id, name (unique per user)
- `memory_tags` — memory_id, tag_id (join table)
- `user_ai_settings` — user_id, provider, api_key, base_url, model configs

## Core Design Rules

- Capture timestamp (`created_at`) is immutable — set automatically, never backdated
- Tags are fully user-controlled — no auto-tagging (AI suggestions are opt-in)
- `@/*` path alias maps to `./src/*`
- Landing page uses its own fonts (Inter body, Outfit headings); app interior uses Geist
- The `NEXT_PUBLIC_*` env vars are baked in at build time — Railway must have them set before building

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anonymous key
OPENAI_API_KEY                # Optional — server-side fallback for AI features
```

## Key Documentation

- `memories-build-plan.md` — Full technical build plan with data model and phased implementation
- `memories-product-brief.md` — Product vision, features, design principles
