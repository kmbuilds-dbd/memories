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

## Design Context

### Users
A single person using Memories as their private journal — capturing moments throughout the day (on mobile, in the moment) and revisiting them later (on any device, relaxed browsing). The user cares about their memories deeply. This is not a task; it's a ritual. They may write a quick line with a photo at a coffee shop, or sit down in the evening to reflect on a meaningful day. The interface must respect both modes.

### Brand Personality
**Warm, intimate, unhurried.** Like sitting in a comfortable chair with a leather-bound journal and good light. The app should feel personal and precious — not clinical, not performative, not trendy. It should feel like it was made by someone who cares about the same things you care about.

### Aesthetic Direction
- **Tone:** Warm & intimate. Day One is the closest reference — clean journal feel, focus on the writing, warm without being saccharine.
- **Color palette:** Warm neutrals — cream, amber, warm grays. Think aged paper, candlelight, soft natural tones. Not sterile white. Not cold gray. The palette should feel like it has warmth baked in, even in dark mode (warm darks, not pure black).
- **Typography:** Needs character and warmth. Avoid generic system fonts (Inter, Roboto, Arial, Geist). Choose a distinctive serif or humanist sans for body text that feels like reading a journal. Pair with a display font for headings that has personality without being loud.
- **Texture & depth:** The interface should have subtle atmosphere — not flat white/gray backgrounds everywhere. Consider warm tints, subtle grain, gentle shadows, or paper-like textures where appropriate.
- **Motion:** Gentle and purposeful. Smooth transitions, subtle reveals. Nothing bouncy or attention-seeking. Motion should feel like turning a page, not like a notification.
- **Dark mode:** Warm darks — deep warm browns/charcoals, not pure black. The warm palette should carry through.

### Anti-References (What This Must NOT Look Like)
1. **Not a social media app** — No feed vibes, no engagement metrics, no notification badges, no like counts. This is private.
2. **Not a productivity tool** — No dashboards, no KPI grids, no hero-metric cards with icons. This is not Notion, Linear, or an admin panel.
3. **Not a generic SaaS template** — No default shadcn look. No "built with AI" aesthetic (gradient text, sparkle icons, purple-on-white). Every component must be intentionally styled, not left at defaults.

### Design Principles
1. **The writing is the hero.** Typography, spacing, and layout should make the written content feel precious and readable. Everything else (chrome, navigation, metadata) recedes.
2. **Warmth over polish.** Choose imperfect and human over sterile and perfect. A warm color, a soft shadow, a textured background — these details make the difference between "software" and "my journal."
3. **Earn every element.** If a component is on screen, it has a reason. No decorative icons, no filler cards, no metrics for metrics' sake. Simplicity is the luxury.
4. **Two speeds, one soul.** Capture mode is fast and minimal (phone, one hand, 30 seconds). Rediscovery mode is rich and immersive (lean back, browse, feel). Both must feel like the same app.
5. **Never generic.** Every design choice — font, color, spacing, animation — should feel intentional and specific to a memories app. If it could work equally well on a banking app or a todo list, it's not specific enough.
