# Memories App — Build Plan

## Overview

A Progressive Web App (PWA) built with Next.js, designed to be hosted on Railway or run locally. The project will be published on GitHub as a portfolio piece demonstrating a full-stack application with authentication, media handling, and full-text search.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 14+ (App Router) | Server-side rendering, API routes built in, React-based, excellent portfolio signal. Data layer is decoupled — frontend can be swapped to iOS/Flutter later without touching the backend. |
| **Styling** | shadcn/ui + Tailwind CSS | Polished, accessible UI components out of the box. Tailwind for rapid custom styling. Great visual impression for a portfolio project. |
| **State Management** | React Server Components + Zustand (client) | Server components handle most data fetching. Zustand for lightweight client-side state where needed. |
| **Backend / Database** | Supabase (PostgreSQL) | Open source, full-text search built in, auth, file storage for media. Data is portable — any future frontend (iOS, Flutter, etc.) can connect to the same backend. |
| **Auth** | Supabase Auth + NextAuth.js | Supabase handles the identity layer. NextAuth.js integrates it cleanly with Next.js middleware and server components. Supports email/password + Google + Apple sign-in. |
| **Media Storage** | Supabase Storage | S3-compatible object storage for photos and videos. Handles uploads, transformations, and CDN delivery. |
| **Search** | PostgreSQL Full-Text Search | Native to Supabase. Supports ranked results, stemming, and phrase matching. AI-powered semantic search can be layered in later. |
| **Hosting** | Railway or local | Railway for deployed version. Can also run locally with `npm run dev`. |
| **PWA** | next-pwa | Service worker, offline caching, installable on mobile home screens — feels like a native app. |

---

## Data Model

### memories

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (FK) | References auth.users |
| content | text | The written memory (main body text) |
| created_at | timestamptz | Immutable system timestamp — the audited capture date |
| updated_at | timestamptz | Last edit timestamp |
| search_vector | tsvector | Auto-generated full-text search index on content |

### media

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| memory_id | uuid (FK) | References memories |
| user_id | uuid (FK) | References auth.users |
| type | enum | 'photo' or 'video' |
| storage_path | text | Path in Supabase Storage bucket |
| thumbnail_path | text | Path to generated thumbnail |
| display_order | integer | Order of media within a memory |
| created_at | timestamptz | Upload timestamp |

### tags

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (FK) | References auth.users |
| name | text | Tag display name (e.g., "#1-songs") |
| created_at | timestamptz | Creation timestamp |
| **Unique constraint** | | (user_id, name) — no duplicate tags per user |

### memory_tags (join table)

| Column | Type | Description |
|--------|------|-------------|
| memory_id | uuid (FK) | References memories |
| tag_id | uuid (FK) | References tags |
| created_at | timestamptz | When the tag was applied |
| **Primary key** | | (memory_id, tag_id) |

### Row Level Security (RLS)

All tables use Supabase RLS policies so users can only read/write their own data. This is critical for a personal app — no user should ever see another user's memories.

---

## App Architecture

```
memories/
  src/
    app/                        # Next.js App Router
      layout.tsx                # Root layout (fonts, theme, providers)
      page.tsx                  # Landing / marketing page
      login/page.tsx            # Login screen
      signup/page.tsx           # Signup screen
      dashboard/                # Main app (behind auth)
        layout.tsx              # App shell with navigation
        page.tsx                # Timeline (home)
        capture/page.tsx        # Create new memory
        search/page.tsx         # Search and browse
        tags/page.tsx           # Tag management
        memory/[id]/page.tsx    # Full memory detail view
    components/
      ui/                       # shadcn/ui components
      MemoryCard.tsx            # Preview card for timeline
      MemoryDetail.tsx          # Full memory view
      MediaUploader.tsx         # Photo/video upload with drag-and-drop
      TagInput.tsx              # Tag creation and selection with autocomplete
      SearchBar.tsx             # Search input with tag filtering
      Timeline.tsx              # Infinite scroll memory list
      Navbar.tsx                # Top navigation bar
    lib/
      supabase/
        client.ts               # Browser Supabase client
        server.ts               # Server-side Supabase client
        middleware.ts           # Auth middleware
      storage.ts                # Media upload/download helpers
      search.ts                 # Full-text search queries
    stores/
      memoryStore.ts            # Client-side memory state (Zustand)
      tagStore.ts               # Client-side tag state (Zustand)
    types/
      index.ts                  # TypeScript interfaces
    hooks/
      useMemories.ts            # Memory data fetching hooks
      useTags.ts                # Tag data fetching hooks
      useSearch.ts              # Search hooks
  public/
    manifest.json               # PWA manifest
    icons/                      # App icons for PWA
  supabase/
    migrations/                 # Database migration files
    seed.sql                    # Optional seed data for development
  middleware.ts                 # Next.js middleware (auth guard)
  next.config.js                # Next.js config (PWA setup)
  tailwind.config.ts            # Tailwind configuration
  .env.local.example            # Environment variable template for GitHub
  README.md                     # Setup instructions, screenshots, architecture
```

---

## Build Phases

### Phase 1: Foundation (Week 1)

**Goal:** Project setup, authentication, and database.

- Initialize Next.js project with TypeScript and App Router
- Set up Tailwind CSS and shadcn/ui
- Set up Supabase project (database, auth, storage bucket)
- Create database tables with migrations and RLS policies
- Implement auth flow with Supabase Auth
  - Email/password sign up and log in
  - Google OAuth
  - Apple Sign-In
  - Auth middleware to protect dashboard routes
- Set up app shell: landing page, login, signup, empty dashboard layout
- Configure PWA basics (manifest, service worker via next-pwa)
- Initialize Git repo with proper .gitignore and README

**Deliverable:** A user can sign up, log in, and see an empty dashboard. The app is installable as a PWA.

---

### Phase 2: Capture Flow (Week 2)

**Goal:** Users can create and save memories.

- Build the capture page
  - Rich text input (supports both short notes and long-form writing)
  - Placeholder prompt: "What made this moment matter?"
  - Drag-and-drop photo upload (also supports file picker and mobile camera)
  - Video upload support
  - Tag input with autocomplete from existing tags
  - Create new tags inline
- Media upload pipeline
  - Client-side image compression before upload
  - Upload to Supabase Storage
  - Generate and store thumbnail references
  - Store references in media table
- Server action or API route to save memory with immutable timestamp
- Success feedback and redirect to timeline after save

**Deliverable:** A user can create a memory with text, photos/videos, and tags.

---

### Phase 3: Timeline (Week 3)

**Goal:** Users can browse their memories chronologically.

- Build the timeline page (dashboard home)
  - Infinite scroll / pagination using cursor-based loading
  - Memory preview cards showing: date, text snippet, media thumbnail, tags
  - Responsive grid/list layout
  - Tap/click to navigate to full memory detail view
- Memory detail page (dynamic route: /dashboard/memory/[id])
  - Full text content
  - Full-size media viewing (image gallery with lightbox, video playback)
  - Display tags as clickable chips (navigate to tag collection view)
  - Edit memory (update text, add/remove tags, add/remove media)
  - Delete memory (with confirmation dialog)
- Pull-to-refresh / refresh button for latest memories

**Deliverable:** A user can scroll through their timeline and view, edit, or delete any memory.

---

### Phase 4: Search and Tags (Week 4)

**Goal:** Users can find and organize their memories.

- Full-text search
  - Search bar with real-time results (debounced)
  - PostgreSQL full-text search on memory content via Supabase RPC
  - Highlighted search matches in results
  - Search results displayed as memory cards
- Tag-based browsing
  - Tags page showing all user tags with memory counts
  - Click a tag to see all memories with that tag (collection view)
  - Tag management: rename, delete tags
- Add/remove tags from existing memories (from memory detail page)
- Combined filtering: search within a tag, or search across all memories
- URL-based filters (e.g., /dashboard/search?q=summer&tag=travel) for shareable/bookmarkable searches

**Deliverable:** A user can search their memories by keyword and browse by tag.

---

### Phase 5: Polish and Launch Prep (Week 5-6)

**Goal:** Make it feel great and prepare for deployment.

- UI/UX polish
  - Typography, spacing, colors — make the timeline feel warm and personal
  - Dark mode support (shadcn/ui has this built in)
  - Smooth page transitions and loading states
  - Empty states ("No memories yet — capture your first one")
  - Error handling and toast notifications
  - Mobile-responsive design (PWA needs to feel great on phones)
- Performance optimization
  - Image optimization with Next.js Image component
  - Lazy loading for media
  - Efficient list rendering with virtualization if needed
  - Server-side rendering for initial page loads
- PWA enhancements
  - Offline graceful degradation
  - App icon and splash screen
  - "Install app" prompt
- GitHub repository polish
  - Comprehensive README with screenshots, setup instructions, architecture diagram
  - .env.local.example with all required variables documented
  - Docker Compose file for easy local setup (optional)
  - MIT license
- Deploy to Railway
  - Environment variables configuration
  - Custom domain setup (optional)
- Bug fixes from testing

**Deliverable:** A polished PWA deployed on Railway, with a clean GitHub repo ready for portfolio presentation.

---

## Claude Code Implementation Strategy

### Getting Started

1. **Share this build plan and the product brief** with Claude Code at the start of each session for context.

2. **Work phase by phase.** Start each Claude Code session with a clear directive like: "We are building Phase 1 of the Memories app. Here is the plan. Let's start with initializing the Next.js project and setting up Supabase."

3. **One feature at a time.** Within each phase, break work into discrete tasks. For example in Phase 2:
   - "Build the capture page UI with text input and tag input"
   - "Add drag-and-drop photo upload using Supabase Storage"
   - "Implement the media upload pipeline with client-side compression"
   - "Wire up the save flow with a server action to write to the database"

### Prerequisites You Need to Set Up Manually

- **Supabase account** — create a project at supabase.com and get your project URL and anon key
- **GitHub account** — for publishing the repository
- **Railway account** (optional) — for deployment. Free tier available.
- **Google Cloud project** — for Google OAuth credentials (configure in Supabase dashboard)
- **Apple Developer account** (optional) — only if you want Apple Sign-In

### What Claude Code Can Build

- All Next.js pages and components
- Supabase database schema and migrations
- Auth flow implementation (Supabase Auth + middleware)
- Media upload/download logic
- Full-text search implementation
- State management (Zustand stores)
- PWA configuration
- API routes / server actions
- TypeScript types and interfaces
- README and documentation
- Railway deployment configuration

### What You Will Need to Configure

- Supabase project credentials (URL, anon key, service role key)
- OAuth provider setup in Supabase dashboard (Google, Apple)
- Railway project and environment variables (if deploying)
- Custom domain (optional)

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Foundation | 1 week | Week 1 |
| Phase 2: Capture Flow | 1 week | Week 2 |
| Phase 3: Timeline | 1 week | Week 3 |
| Phase 4: Search and Tags | 1 week | Week 4 |
| Phase 5: Polish and Launch | 1-2 weeks | Week 5-6 |

**Total estimated MVP build time: 5-6 weeks**

Note: These estimates assume focused sessions with Claude Code. Actual timeline depends on session frequency, debugging, and iteration on design decisions.

---

## Hosting Architecture

| Component | Where it runs | Cost |
|-----------|--------------|------|
| Next.js app | Railway (or locally via `npm run dev`) | Railway free tier / $5+ per month |
| Database | Supabase cloud (PostgreSQL) | Free tier (500MB DB, 1GB storage) |
| Auth | Supabase cloud | Free tier (50,000 monthly active users) |
| Photos/videos | Supabase Storage (S3-compatible) | Free tier (1GB), then $0.021/GB |
| Domain (optional) | Any registrar | ~$10-15/year |

---

## GitHub Portfolio Considerations

- **Clean commit history** — commit at the end of each feature, not just each phase
- **Comprehensive README** — project description, screenshots/GIF demos, tech stack, setup instructions, architecture diagram
- **.env.local.example** — document every environment variable so anyone can clone and run
- **MIT License** — standard for portfolio projects
- **Issues and project board** — optionally use GitHub Issues to track features (shows project management skills)
- **No secrets in code** — all credentials via environment variables

---

## Future Enhancements (Post-MVP Roadmap)

1. **AI-powered semantic search** — vector embeddings for contextual search and memory correlation
2. **AI-assisted tag discovery** — surface patterns and suggest groupings
3. **Memory resurfacing** — "On this day" notifications showing memories from past years
4. **Voice note capture** — record and transcribe voice memories
5. **Native mobile app** — React Native or Flutter app connecting to the same Supabase backend
6. **Export** — download all memories as a backup or in a readable format
7. **Rich text editing** — bold, italic, headers within memory content
8. **Collaborative memories** — optionally share specific memories or collections with selected people
