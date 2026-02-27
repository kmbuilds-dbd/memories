# Memories App — Warm Journal Redesign

**Date:** 2026-02-26
**Approach:** Foundation-first cascade (Option A) — design system layer first, then page-by-page

---

## Design Foundation

### Typography

| Role | Font | Usage |
|---|---|---|
| **Display** | Playfair Display (serif) | Brand mark, page titles, "Memories" wordmark |
| **Body** | Lora (serif) | Memory content, journal text, descriptions |
| **UI Chrome** | DM Sans (humanist sans) | Buttons, nav labels, form labels, metadata, tags, dates |

Rationale: Playfair Display gives literary, elegant headings. Lora has calligraphic roots and reads beautifully on screen — makes text feel like a journal entry. DM Sans is warm but clean for UI elements that recede behind content.

### Color Palette

**Light mode — "Aged Paper":**

| Token | Value | Description |
|---|---|---|
| background | `oklch(0.98 0.008 80)` | Warm cream, not white |
| foreground | `oklch(0.22 0.02 65)` | Warm brown-black ink |
| card | `oklch(0.975 0.006 80)` | Slightly different cream |
| muted | `oklch(0.935 0.012 75)` | Warm beige (linen) |
| muted-foreground | `oklch(0.55 0.03 65)` | Warm brown-gray |
| border | `oklch(0.91 0.015 75)` | Soft warm edge |
| primary | `oklch(0.55 0.1 60)` | Warm amber accent |
| primary-foreground | `oklch(0.98 0.005 80)` | Cream text on amber |
| secondary | `oklch(0.94 0.01 75)` | Warm light beige |
| accent | `oklch(0.94 0.01 75)` | Warm beige |
| ring | `oklch(0.65 0.06 60)` | Amber focus ring |
| destructive | `oklch(0.55 0.18 25)` | Warm red |

**Dark mode — "Candlelight":**

| Token | Value | Description |
|---|---|---|
| background | `oklch(0.18 0.015 65)` | Deep warm brown, not black |
| foreground | `oklch(0.92 0.01 75)` | Warm cream text |
| card | `oklch(0.22 0.015 65)` | Slightly lighter warm brown |
| muted | `oklch(0.28 0.015 65)` | Warm dark |
| muted-foreground | `oklch(0.62 0.025 65)` | Warm gray |
| border | `oklch(0.92 0.01 75 / 10%)` | Warm border, low opacity |
| input | `oklch(0.92 0.01 75 / 15%)` | Warm input |
| primary | `oklch(0.7 0.08 60)` | Lighter amber for dark |
| primary-foreground | `oklch(0.2 0.015 65)` | Dark text on amber |
| ring | `oklch(0.55 0.04 60)` | Muted amber ring |
| destructive | `oklch(0.7 0.19 22)` | Lighter warm red |

Key principle: every color has a warm hue bias (65-80 oklch). Zero achromatic grays.

### Texture

Subtle CSS noise/grain overlay on body background at ~3-5% opacity. Paper-like feel without being heavy-handed.

---

## Page Designs

### Landing Page

- Remove: gradient text, Sparkles icon, three philosophy columns, "Start Your Journey" copy
- Header: "Memories" in Playfair Display (no gradient). "Sign In" link in DM Sans.
- Hero: One line in Playfair Display — "A quiet place for the moments that matter." Brief subtext in Lora.
- Visual: Simple illustrative mockup of a journal entry (warm background, Lora text, date, photo thumbnail)
- CTA: Warm amber button — "Begin" or "Create Your Journal"
- Background: Warm cream with grain texture

### Auth Pages (Login/Signup)

- Warm cream background continuous with landing
- Card gets soft warm shadow, warmer card background
- "Memories" brand mark above form in Playfair Display
- Form labels in DM Sans, primary button in warm amber
- Google button with warm border

### Dashboard Shell (Navbar + Layout)

- Brand: "Memories" in Playfair Display italic
- Nav links: DM Sans, quiet (muted-foreground default, foreground when active). No icon labels on desktop; icons only on mobile.
- Replace `border-b` with subtle warm shadow
- Warm cream base with grain texture

### Timeline (Dashboard Home)

- Remove Calendar/Tags buttons from header (already in navbar)
- Page header: "Your Memories" in Playfair Display, greeting in Lora muted
- Create Memory: Standalone warm amber button, prominent. Mobile: floating action button (bottom-right, amber)
- Memory cards:
  - Content previewed in Lora
  - Dates in DM Sans, warm muted
  - Tags as warm beige pills
  - Photo thumbnails with soft shadow
  - Date separators between month groups ("February 2026")
  - Warm cream card background with soft shadow (no hard border)
- Warm-toned loading skeletons

### Capture Form

- Title: "New Memory" in Playfair Display
- Textarea: Lora font, warm cream background, generous padding. Placeholder: "What made this moment matter?"
- Media uploader: Warm dashed border
- Tag input: Warm beige pills, warm dropdown
- Save: Warm amber, full-width. "Save Memory"

### Memory Detail

- Content: Lora at 18px, line-height 1.75, max-width ~65ch
- Date header: DM Sans small/light — "Thursday, February 14, 2026" — journal entry stamp feel
- Photos: Generous layout, soft rounded corners, warm shadows
- Tags: Small warm beige pills, unobtrusive
- Actions (Edit/Delete): Pushed down, smaller, recessed

### Stats Page

Replace hero-metric grid with editorial prose in Lora:

> You've captured **42 memories** since March 12, 2024. That's about **3 per week**.
> Your longest streak was **12 days**. Right now you're on a **4-day streak**.
> This month: **8 memories**. This week: **3**.

Top tags as inline warm badges. No icons, no cards, no grid.

### Calendar

- Amber dots for active days, selected day in amber
- Warm card backgrounds
- No structural changes

### Year Review

- Month headers in Playfair Display
- Summary stats as prose (not card with big numbers)
- Redesigned warm memory cards

### Tags + Settings

- Warm theming applied
- Remove Sparkles icons from tag discovery buttons
- No structural changes
