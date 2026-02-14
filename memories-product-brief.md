# Memories — Product Brief

## Vision

Memories is a personal time capsule — a single place to capture, organize, and rediscover the moments, stories, and experiences that define your life. It is not a social app. There is no audience, no likes, no sharing. It is built for one purpose: helping you record memories today so future you can reminisce and rediscover them.

---

## Product Philosophy

Every design decision optimizes for two moments:

1. **The moment of capture** — fast, frictionless, available when the moment strikes
2. **The moment of rediscovery** — emotionally rich, easy to browse, full of pleasant surprises

Memories is a **storytelling tool**, not a logging tool. Every entry — whether it is a song, a photo, or an adventure — has a narrative core. The app gently encourages you to capture *why* something mattered, not just *what* happened.

---

## Core Concepts

### Memory

A memory is the atomic unit of the app. It can contain:

- **Text** — from a single line to multiple paragraphs
- **Photo** — one or more images attached to the memory
- **Video** — short video clips attached to the memory
- Any combination of the above

Every memory has:

- **System timestamp** — immutable, automatically set at the time of capture. This is the audited truth of when the memory was recorded. It cannot be edited or backdated.
- **Tags** — user-defined labels for organization and discovery
- **Content** — the story, the note, the reflection

If a memory references a past event (e.g., "my #1 song from college in 2015"), the temporal context lives in the written content, not in a separate date field.

### Tags

Tags are the primary organizational layer. They are **fully user-controlled**.

- Created by the user at the time of capture
- Can be added to existing memories at any time as the user sees new correlations
- No auto-tagging — the app never applies tags without user action
- Examples: #1-songs, #solo-adventures, #moments-with-son, #travel

**AI-assisted discovery (not auto-tagging):** The app may surface patterns it notices (e.g., "You have 4 memories that mention travel with strangers — would you like to tag them together?"). The user decides whether to act on the suggestion. Tags only exist when the user says so.

### Timeline

The timeline is the default home experience — a chronological stream of your life's memories. Recent at the top, scroll down to travel back in time. Each entry shows a preview (text snippet, thumbnail, tags, date) to trigger recognition without overwhelming.

---

## MVP Features

### Capture Flow

- One tap to start a new memory
- Simple screen: text input, optional photo/video attachment, tag input
- Existing tags are suggested as you type, with the ability to create new ones
- Save — timestamp is automatic
- Designed to support both quick captures (30 seconds, a photo and a line) and longer reflections (10 minutes of writing)
- The app should gently prompt: "What made this moment matter?" — not intrusively, but enough to encourage storytelling

### Timeline View

- Chronological feed of all memories
- Each memory shows: date, text preview, media thumbnail (if any), tags
- Tap to expand and read the full memory
- Scrolling through the timeline should feel like reading your own autobiography

### Search

- **Tag-based search** — tap a tag to see all memories with that tag as a collection
- **General text search** — keyword search across all memory content
- **Correlation/AI search** — ability to search contextually (e.g., "summer 2019") and surface memories that reference that period in their content, even without explicit tags

### Tags Management

- View all tags
- Browse memories by tag (collection view)
- Add or remove tags from existing memories

---

## Out of Scope (Post-MVP)

- Voice note capture
- Desktop/web app
- Sharing or social features
- Auto-tagging
- Backdating / custom timestamps
- Notifications / memory resurfacing ("On this day" style)
- Export functionality

---

## Design Principles

1. **Capture friction is the enemy.** Every extra tap or field is a reason to not record a memory. Keep it minimal.
2. **The story is the soul.** Metadata (dates, tags, song names) is useful, but the written narrative is what makes a memory worth revisiting.
3. **User controls organization.** No AI-generated clutter. The user decides what is meaningful enough to tag and group.
4. **Time is sacred.** The capture timestamp is immutable truth. The story's time lives in the words.
5. **Rediscovery should feel like magic.** Browsing your timeline or searching your memories should feel like opening a box of treasured things — not querying a database.

---

## Platform

- **Progressive Web App (PWA)** — hosted on Railway or run locally
- Native mobile app to follow in a later phase, connecting to the same Supabase backend

---

## Open Questions

- What is the right AI involvement in search and correlation? How much intelligence should the app apply when connecting memories across tags and time?
- Should there be a "memory resurfacing" feature (e.g., "3 years ago today...") in a future version? This aligns with the rediscovery philosophy but was not discussed as MVP.
- Photo/video limits — any constraints on media per memory?
- Offline capture support — should the app work without connectivity?
