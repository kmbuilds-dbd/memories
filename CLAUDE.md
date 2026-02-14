# Memories App

## What This Is
Memories is a personal time capsule PWA — a single place to capture, organize, and rediscover moments, stories, and experiences. It is a private, personal app with no social features. Designed for two moments: the moment of capture (fast, frictionless) and the moment of rediscovery (emotionally rich, easy to browse).

## Tech Stack
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** shadcn/ui + Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password + Google + Apple sign-in)
- **Media Storage:** Supabase Storage (S3-compatible)
- **Search:** PostgreSQL Full-Text Search
- **State:** React Server Components + Zustand for client state
- **PWA:** next-pwa
- **Hosting:** Railway or local

## Supabase
- Project URL: https://ivhpbucigkvxiboyyhky.supabase.co
- Credentials stored in .env.local (never commit these)

## Key Documentation
- `memories-build-plan.md` — Full technical build plan with data model, architecture, and phased implementation
- `memories-product-brief.md` — Product vision, features, design principles

## Build Phases
1. **Phase 1: Foundation** — Project setup, auth, database schema, app shell
2. **Phase 2: Capture Flow** — Create memories with text, photos/videos, tags
3. **Phase 3: Timeline** — Chronological browsing, memory detail view, edit/delete
4. **Phase 4: Search and Tags** — Full-text search, tag browsing, combined filtering
5. **Phase 5: Polish** — UI polish, dark mode, PWA enhancements, Railway deployment, GitHub README

## Core Design Rules
- Capture timestamp is immutable — set automatically, never backdated
- Tags are fully user-controlled — no auto-tagging
- All tables use Supabase RLS — users can only access their own data
- Capture flow placeholder prompt: "What made this moment matter?"
- MVP uses PostgreSQL full-text search only — AI/semantic search comes later

## Database Tables
- `memories` — id, user_id, content, created_at (immutable), updated_at, search_vector
- `media` — id, memory_id, user_id, type (photo/video), storage_path, thumbnail_path, display_order
- `tags` — id, user_id, name (unique per user)
- `memory_tags` — memory_id, tag_id (join table)
