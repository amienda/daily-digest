---
name: Daily Digest
description: A personal editorial-feeling triage desk for daily article digests.
colors:
  canvas: "#fafaf9"
  canvas-deep: "#0c0a09"
  paper: "#ffffff"
  paper-deep: "#1c1917"
  ink: "#1c1917"
  ink-inverted: "#fafaf9"
  ink-soft: "#78716c"
  ink-mute: "#a8a29e"
  hairline: "#e7e5e4"
  hairline-deep: "#292524"
  hover-surface: "#f5f5f4"
  hover-surface-deep: "#292524"
  hearted: "#ef4444"
  hearted-soft: "#fef2f2"
  hearted-border: "#fecaca"
  hearted-ink: "#dc2626"
typography:
  display:
    fontFamily: "Newsreader, Charter, Lora, Georgia, ui-serif, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Newsreader, Charter, Lora, Georgia, ui-serif, serif"
    fontSize: "1.65rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Newsreader, Charter, Lora, Georgia, ui-serif, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "-0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-inverted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.hairline-deep}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.hover-surface}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.hover-surface}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "28px"
    padding: "0 10px"
  chip-active:
    backgroundColor: "{colors.hover-surface}"
    textColor: "{colors.ink}"
  chip-hearted-active:
    backgroundColor: "{colors.hearted-soft}"
    textColor: "{colors.hearted-ink}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  card-hover:
    backgroundColor: "{colors.canvas}"
  tab-count-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-inverted}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "20px"
  tab-count-inactive:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    height: "20px"
---

# Design System: Daily Digest

## 1. Overview

**Creative North Star: "The Curator's Notebook"**

The interface is a private, considered notebook. Each day, an upstream curator (the
Cowork automation) writes a fresh page of articles into it. The owner opens the
notebook, scans the page, and marks each entry — *keep, save for later, archive* —
the way you'd annotate a printed digest with a pen. Reading itself happens
elsewhere; the notebook is the act of *deciding*.

The visual system is paper-and-ink. Warm off-white canvas, near-black text tinted
toward the same hue, hairline rules instead of cards-that-float, generous serif
headlines doing all the storytelling work. The interactive controls are quiet and
monochrome so the typography stays the loudest thing on the page. There is exactly
one saturated color in the entire system — a red reserved for the act of hearting
an article — and that scarcity is the point.

The system explicitly rejects two adjacent aesthetics that would dilute the
notebook feel: the **email-client / inbox UI** (unread counters, bulk-action
chrome, dense rows of checkboxes) and **generic SaaS dashboards** (gradient hero
metrics, identical card grids, sidebar icon navs, "welcome back" surfaces). This
app belongs to one person; it reads that way.

**Key Characteristics:**
- Newsreader serif headlines on a warm stone canvas; system sans for all UI chrome.
- Depth via tonal layering only — no box-shadows for decoration.
- One earned saturated accent (Hearted Red); all other interactive color is
  monochrome stone.
- Eight muted category accent pills, used as identification, never as brand color.
- Refined-and-restrained components: rounded-lg buttons, rounded-full chips,
  rounded-2xl cards, all with comfortable 44px touch targets.
- One serif rule: Newsreader is for *voice* (headlines, titles); never for
  controls or labels.

## 2. Colors

A warm-stone paper-and-ink palette. The whole interface is built from Tailwind's
**stone** family — a neutral gray with a slight yellow-brown undertone, the closest
Tailwind ships to "tinted toward warm paper." The single saturated accent is a
red, used for one act only.

### Primary

The system has no traditional brand primary. Type and rhythm carry the
personality. The closest thing is a single earned accent:

- **Hearted Red** (`#ef4444` / red-500): the heart fill on a hearted article, the
  focus ring on the heart button, and the active state of the Hearted filter chip.
  Nowhere else, ever.
- **Hearted Soft** (`#fef2f2` / red-50) + **Hearted Border** (`#fecaca` / red-200)
  + **Hearted Ink** (`#dc2626` / red-600): the recessed pill state for the
  Hearted filter chip when toggled on.

### Neutral

- **Warm Canvas** (`#fafaf9` / stone-50): light mode body surface. Warm off-white,
  the page of the notebook.
- **Deep Canvas** (`#0c0a09` / stone-950): dark mode body surface. Near-black,
  tinted warm.
- **Paper** (`#ffffff` / white): elevated surfaces (cards, popovers, toast) in
  light mode.
- **Deep Paper** (`#1c1917` / stone-900): elevated surfaces in dark mode.
- **Ink** (`#1c1917` / stone-900): body text in light mode.
- **Inverted Ink** (`#fafaf9` / stone-50): body text in dark mode.
- **Soft Ink** (`#78716c` / stone-500): secondary text — publication names,
  empty-state descriptions.
- **Mute Ink** (`#a8a29e` / stone-400): tertiary text — dates, icons, focus rings.
- **Hairline** (`#e7e5e4` / stone-200): borders, dividers, the tab underline track.
- **Deep Hairline** (`#292524` / stone-800): borders in dark mode.
- **Hover Surface** (`#f5f5f4` / stone-100): subtle hover wash in light mode.
- **Deep Hover Surface** (`#292524` / stone-800): subtle hover wash in dark mode.

### Category Accents (system)

Eight category accents power the colored pills on every article card. Each is a
Tailwind 100-shade background plus an 800-shade text in light mode, paired with a
900-at-40%-opacity background plus a 200-shade text in dark mode. The pills are
deliberately muted — they read as *categorization*, not as *brand color*.

| Category            | Light bg / text                | Dark bg / text                    |
|---------------------|--------------------------------|-----------------------------------|
| Advertising         | `#fef3c7` / `#92400e`          | `amber-900/40` / `#fde68a`        |
| Brand & Marketing   | `#dbeafe` / `#1e40af`          | `blue-900/40` / `#bfdbfe`         |
| Media & Platforms   | `#f3e8ff` / `#6b21a8`          | `purple-900/40` / `#e9d5ff`       |
| Culture             | `#fce7f3` / `#9d174d`          | `pink-900/40` / `#fbcfe8`         |
| Fashion & Beauty    | `#ffe4e6` / `#9f1239`          | `rose-900/40` / `#fecdd3`         |
| Tech                | `#dcfce7` / `#166534`          | `green-900/40` / `#bbf7d0`        |
| Opinion & Essay     | `#f1f5f9` / `#1e293b`          | `slate-800/60` / `#e2e8f0`        |
| Other               | `#f3f4f6` / `#1f2937`          | `gray-800/60` / `#e5e7eb`         |

### Named Rules

**The One Accent Rule.** Hearted Red is the only saturated color in the system.
Category pills are muted and named. Buttons are monochrome. Focus rings are stone.
The interface is editorial first; color is identification, not decoration.

**The Pure-Black Ban.** No `#000`, no `#fff` for surfaces. All neutrals carry a
warm tint — Tailwind's stone family. White (`#ffffff`) is allowed only as the
elevated paper surface against the warm canvas; never as canvas itself.

## 3. Typography

**Display Font:** **Newsreader** (with Charter, Lora, Georgia, ui-serif as
fallback). Designed specifically for screen reading — warmer and more contemporary
than Charter, optical sizing built in.

**Body Font:** **System Sans** —
`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial`.
Lets the OS render its native UI face.

**Character:** A serif/sans pairing with strong job separation. Newsreader does
the storytelling — the "Daily Digest" title, every article headline, every
empty-state line. Sans handles all UI chrome and prose body: recede-and-support.

### Hierarchy

- **Display** (font-serif, 600, `clamp(1.875rem, 5vw, 2.25rem)`, lh 1.1, tracking
  -0.025em): the "Daily Digest" page title only. Appears once per session.
- **Headline** (font-serif, 600, `1.65rem` desktop / `1.5rem` mobile, lh 1.2,
  text-balance): every article card headline. Linked, underline on hover.
- **Title** (font-serif, 500, `1.25rem`, lh 1.3): empty-state titles. The one
  place serif appears outside the page title and article headlines.
- **Body** (font-sans, 400, `0.95rem`, lh 1.6): article summaries, empty-state
  descriptions. Max width ~65ch (`max-w-prose`).
- **Meta** (font-sans, 400, `0.875rem`, lh 1.5, *italic*): publication names. The
  one place italics appear.
- **Label** (font-sans, 500, `0.75rem`, tracking -0.01em): chips, tabs, buttons,
  count badges, all UI labels.
- **Micro** (font-sans, 400, `0.75rem`): dates, secondary metadata.

### Named Rules

**The Serif-Only-For-Voice Rule.** Newsreader appears exclusively on the page
title, article headlines, and empty-state titles — the *voice* of the digest.
Every interactive element (buttons, tabs, chips, labels) is sans. Serif is for
what *is*; sans is for what you *do*.

**The Italic-Only-For-Publication Rule.** Italics appear in exactly one place: the
publication name under each headline. Never in body copy. Never in UI labels.

## 4. Elevation

**Tonal layering only. No box-shadows for decoration.**

The system conveys depth through tinted surface stacks, not through shadows.
Pieces of paper don't float; they sit on each other.

### The stack

- **Light mode:** Warm Canvas (`stone-50`) → Paper (`white`) → Hover Surface
  (`stone-100`). Three layers maximum.
- **Dark mode:** Deep Canvas (`stone-950`) → Deep Paper (`stone-900`) → Deep
  Hover Surface (`stone-800`).

A 1px Hairline border around a white card on Warm Canvas reads as elevated
without any shadow. That's the whole depth model.

### Named Rules

**The No-Shadow Rule.** Box-shadows of any kind are prohibited as decoration. The
lone exception is `focus-visible` outlines — those are Mute Ink rings, not blurs.

**Legacy note.** The current ArticleCard uses `shadow-sm` at rest and `shadow-md`
on hover; the Toast uses `shadow-lg`; the Owner PIN popover uses `shadow-xl`.
These are pre-doctrine and scheduled for revision: cards should switch to a tonal
hover (background shifts to Hover Surface), and toasts and popovers should rely on
their hairline borders plus tonal contrast against the canvas.

## 5. Components

### Buttons

**Character:** Refined and restrained — minimal chrome, generous touch targets, no
decoration. Three monochrome variants; no color buttons.

- **Shape:** `rounded-lg` (8px), same radius across variants.
- **Size:** min-height 44px (the `tap-target` utility), padding 14px × 8px
  (`px-3.5 py-2`). Comfortable on phone and desk.
- **Primary:** Ink on Paper (stone-900 bg, stone-50 text) in light mode;
  inverted in dark. Used for **Save to Instapaper** — the default-positive
  triage decision.
- **Secondary:** Paper with Hairline border (white bg, stone-200 border, stone-800
  text). Used for **Reading List** and **Move to Today**.
- **Ghost:** Soft Ink, no fill, hover bg of Hover Surface. Used for **Not
  Interested** — visually receded because archiving is the cheap default action.
- **Hover:** background shifts one tonal step (primary → stone-800; secondary →
  Hover Surface; ghost → Hover Surface).
- **Focus:** Mute Ink ring-2 via `focus-visible`. No glow, no blur.
- **Loading:** inline 16px spinner SVG, `animate-spin`, sits beside the label
  (label stays visible — never replaced with a generic "Loading…").

### Chips

**Character:** Stadium-shaped pills, deliberately small (28px tall) so the filter
row sits *under* the tab bar without competing for attention.

- **Shape:** `rounded-full`, `h-7` (28px), `text-xs`, `font-medium`.
- **Inactive:** Paper bg, Hairline border, Soft Ink text.
- **Active:** Hover Surface bg, Mute Ink border, Ink text. Dark mode: Deep Hover
  Surface bg, stone-500 border, Inverted Ink text.
- **Hearted (special):** when active, uses Hearted Soft bg + Hearted Border +
  Hearted Ink. The *only* chip allowed to break monochrome, because Hearted Red
  is the system's one earned accent.
- **Category pills (on cards):** smaller variant — `rounded-full`,
  `px-2.5 py-0.5`, `text-xs`. Non-interactive labels using the eight category
  accents above.

### Cards

**Character:** A piece of paper on the canvas. Bordered, square-ish corners, generous
internal padding. The card *is* the article.

- **Shape:** `rounded-2xl` (16px).
- **Background:** Paper (white / Deep Paper).
- **Border:** 1px Hairline (stone-200 / stone-800).
- **Internal padding:** 20px mobile, 24px desktop (`p-5 sm:p-6`).
- **Hover:** background shifts toward Warm Canvas (light) or Deep Hover Surface
  (dark). No shadow lift. (Current code still uses shadow-sm → shadow-md; see
  Elevation legacy note.)
- **Layout:** 1 column on mobile, 2 column grid at the `lg` breakpoint (1024px+).
- **Internal rhythm:** category pill + heart + date on row 1, headline row 2,
  publication row 3, summary row 4, action buttons row 5 (owner-only).

### Tabs

**Character:** Text-led navigation; the count badge is a quiet companion, not a
focal point. There is no "X new" emphasis.

- **Style:** text-only, no background fill. Active state is a 2px rounded
  underline (Ink / Inverted Ink) plus full-strength text color.
- **Inactive:** Soft Ink, no underline; hover bumps text one tonal step.
- **Count badge:** `rounded-full` pill inside the tab, `h-5`, `min-w-1.25rem`,
  `text-xs`. Active variant inverts (Ink bg, Canvas text); inactive variant uses
  Hairline bg + Soft Ink text.

### Inputs (Owner PIN field)

- **Style:** `rounded-lg`, Warm Canvas bg (so it sits *into* the popover, not
  above it), Hairline border, `0.875rem` text.
- **Focus:** Mute Ink ring-2 via `focus-visible`. No glow.
- **Error:** inline `text-xs` red note below the input — no border shift.

### Toast

- **Style:** `rounded-lg`, Paper bg, 1px border tinted by variant (green-200
  success, red-200 error, Hairline info), small 8px colored dot on the leading
  edge as a status marker.
- **Placement:** bottom-center on mobile, bottom-right on desktop.
- **Motion:** 120ms `ease-out` fade-in (the system's *one* permitted
  CSS-keyframe animation). Auto-dismiss at 4000ms.

### Owner Gate (signature component)

A 40 × 40 round padlock button sits in the page header. When clicked, it reveals
a 208px-wide popover anchored to its right edge, containing the PIN field and an
Unlock button. Locked state shows a closed padlock; unlocked state shows an open
padlock. Click-outside dismisses the popover. The popover uses `rounded-xl`,
Paper bg, Hairline border — it sits *on* the canvas, not above it. Once unlocked,
the article action buttons (Save to Instapaper, Reading List, Not Interested,
heart) become interactive; visitors see the cards as a read-only digest.

## 6. Do's and Don'ts

### Do:
- **Do** use **Newsreader** for headlines, the page title, and empty-state titles.
  Charter / Lora / Georgia are fallbacks while Newsreader loads, not co-equal
  choices.
- **Do** keep body copy at `0.95rem`, line-height 1.6, max ~65ch (`max-w-prose`).
- **Do** convey depth via the three-layer tonal stack: Canvas → Paper → Hover
  Surface. Three layers maximum.
- **Do** reserve Hearted Red for the heart icon (fill, focus ring) and the
  Hearted filter chip's active state. Nowhere else.
- **Do** keep filter chips at `h-7` (28px) so they sit visually below the tab
  bar, never competing with it.
- **Do** keep tap targets at ≥ 44px (the `tap-target` utility). Applies to
  every interactive element, not just buttons.
- **Do** prefer `focus-visible` over `focus` for ring states, so mouse clicks
  don't leave a halo.
- **Do** use the eight muted category accents from the table above for category
  pills. New categories without a deliberate palette extension fall back to
  Other (gray).

### Don't:
- **Don't** add box-shadows for decoration. Cards do not float. (Current
  `shadow-sm` / `shadow-md` on the article card is legacy; new components should
  use a tonal hover instead.)
- **Don't** introduce a second saturated accent. The system has *one* color
  (Hearted Red), and it is earned by the act of hearting.
- **Don't** style the interface like an **email client / inbox UI** — no unread
  bolding, no "X new" counters, no checkbox-and-row bulk-action affordances, no
  action buttons crammed against a right edge. This is not an inbox; it is a
  digest to triage. (Per PRODUCT.md anti-references.)
- **Don't** style the interface like **generic SaaS chrome** — no gradient hero
  metrics, no identical card grids beyond what's already here, no sidebar icon
  nav, no "Welcome back" surfaces. The app belongs to one person; it should feel
  that way. (Per PRODUCT.md anti-references.)
- **Don't** use side-stripe borders (`border-left` greater than 1px as a colored
  accent) on cards, callouts, or alerts. Full borders or none.
- **Don't** use gradient text or `background-clip: text`. Solid colors only.
- **Don't** use glassmorphism, backdrop-filter blurs, or frosted overlays.
- **Don't** use Newsreader for chips, buttons, tab labels, or any UI control.
  Serif is for voice only.
- **Don't** use italic anywhere except the publication name. Not in body. Not in
  labels. Not in emphasis within prose.
- **Don't** invent new category colors. The eight Tailwind hues are the system;
  new categories fall back to Other until a deliberate palette extension is made.
- **Don't** use `#000` or `#fff` for body surfaces. Stone family only; white is
  reserved for the elevated Paper layer.
