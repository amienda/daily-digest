# Product

## Register

product

## Users

A single owner (you), doing a daily triage sweep of articles that a separate Cowork
automation pre-curates into Supabase. Used across contexts: a slow morning coffee
session at the desk, quick spare-moment sweeps on phone, and reflective end-of-day
sweeps. The interface is owner-gated by PIN — there are no other users, no sharing,
no collaboration. The actual reading happens later, elsewhere (Instapaper, the
hearted reading list) — never inside this app.

## Product Purpose

A personal, editorial-feeling digest. Each item was already chosen *for* the owner
by an upstream curation step — the job here is to scan enough (headline, source,
one-line summary) to decide where the article goes: save to Instapaper for proper
reading, heart it for the personal reading list, or archive. Success is fast,
pleasant triage that leaves a curated reading list ready for later — not a stack of
unread items to catch up on.

## Brand Personality

Considered, quiet, literary. Reads like a thoughtful editor curated it — closer to
Stratechery, The Browser Company's blog, or a printed digest than to a SaaS app.
Voice is restrained and grown-up: short, declarative, no marketing energy, no
emoji-toned exclamation, no exhortations. The owner is the only reader, so the tone
is the tone of a private notebook, not a product.

## Anti-references

- **Email client / inbox UI.** Not Gmail, not Outlook, not Superhuman. No unread
  bolding, no "X new" counters, no checkboxes-and-bulk-actions row design, no
  action buttons crammed against a right edge. This is not an inbox to process; it
  is a digest to triage.
- **Generic SaaS chrome.** No gradient hero metrics, no identical card grids, no
  sidebar nav with icons, no "Welcome back" surfaces. The app belongs to one person
  — it should feel that way.

## Design Principles

1. **Triage is the job.** The app is not a reader. The owner scans enough — headline,
   source, one-line summary — to make a routing decision. Triage controls (heart,
   save to Instapaper, archive) are first-class: visible, reachable, fast. Reading
   happens later, elsewhere.
2. **Curated, not infinite.** Each article was pre-selected. The design should
   respect that — no engagement counts, no feed-style infinite scroll mannerisms,
   no "X items remaining" pressure. Finite, considered, finishable.
3. **Pleasant in both gears.** Works for a deliberate 20-minute desk session and a
   3-minute phone sweep. Speed never overrides grace; grace never blocks speed.
4. **Personal, not corporate.** One owner, no team framing. No onboarding nudges,
   no empty marketing surfaces, no "welcome to your dashboard." The tool feels
   owned.
5. **Type does the work.** Visual interest comes from typography (Newsreader),
   rhythm, and whitespace — not from decoration, gradients, or color systems.

## Accessibility & Inclusion

WCAG AA on the basics: 4.5:1 contrast on body copy, 3:1 on UI elements, full
keyboard navigation, visible focus states. Motion is allowed to be expressive
without a strict prefers-reduced-motion fallback for every transition — animations
should be subtle enough that this is a minor exposure, not a major one.
