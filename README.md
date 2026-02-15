# Memories

A personal time capsule PWA for capturing, organizing, and rediscovering moments.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Search:** PostgreSQL full-text search
- **PWA:** next-pwa with offline support

## Features

- Email/password and Google authentication
- Create memories with text, photos, and videos
- Chronological timeline with infinite scroll
- Full-text search and tag-based filtering
- Tag management (create, rename, delete)
- Media lightbox with swipe navigation
- Dark mode (system, light, dark)
- Installable PWA

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

   ```bash
   cp .env.local.example .env.local
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).
