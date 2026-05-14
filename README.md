# Daily Digest

A personal triage interface for a daily media digest. Articles land in
Supabase from a separate Cowork automation; this app lets you sweep
through them and route each one to Instapaper, a reading list, or the
archive.

- **Frontend:** React + Vite + TypeScript, Tailwind CSS
- **Data:** Supabase (Postgres) via the new publishable key system
- **Backend:** One Vercel serverless function for the Instapaper proxy

---

## 1. Setup

```bash
npm install
cp .env.example .env.local
# fill in the four values described below
```

### Env vars — what goes where, and why

There are two distinct categories. The split is enforced by Vite:
**only variables prefixed with `VITE_` are bundled into the browser**.
Anything else exists only on the server.

#### Frontend (bundled into the browser)

| Name | Why it's safe to ship to the browser |
| --- | --- |
| `VITE_SUPABASE_URL` | Public project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase's new publishable key (`sb_publishable_…`). Row Level Security is the gatekeeper — the key itself is designed to be public. |

#### Server-side only (must NEVER be prefixed with `VITE_`)

| Name | Used by |
| --- | --- |
| `INSTAPAPER_USERNAME` | `api/instapaper-save.ts` |
| `INSTAPAPER_PASSWORD` | `api/instapaper-save.ts` |

These credentials are read inside the Vercel serverless function and
are never sent to the browser, never included in any response body,
and never logged. If you ever see a `VITE_INSTAPAPER_…` variable
anywhere in this repo, that's a security regression — please fix it.

---

## 2. Run locally

### Frontend only (Supabase reads/writes work; Instapaper does not)

```bash
npm run dev
```

The dev server runs at <http://localhost:5173>. Article tabs and the
"Reading List" / "Not Interested" buttons will work because they hit
Supabase directly. "Save to Instapaper" will fail because the
serverless function is not running.

### Frontend + serverless function (everything works)

```bash
npm i -g vercel       # one-time
vercel link           # one-time, picks the Vercel project
vercel dev
```

`vercel dev` serves both the Vite app and `/api/instapaper-save` on the
same origin (usually <http://localhost:3000>). It reads server-side env
vars from `.env.local` automatically.

Quick smoke test of the function:

```bash
curl -X POST http://localhost:3000/api/instapaper-save \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'
```

---

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo. The framework should
   auto-detect as **Vite**.
3. Add env vars in **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL` (Production, Preview, Development)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (Production, Preview, Development)
   - `INSTAPAPER_USERNAME` (Production, Preview only — leave out of
     Development if you'd rather use `.env.local`)
   - `INSTAPAPER_PASSWORD` (same as above)
4. Deploy. Vercel will build with `npm run build` and serve the SPA
   from `dist/`. Files under `api/*.ts` are auto-deployed as
   serverless functions.

After deploying, hit `https://<your-deployment>/api/instapaper-save`
with a `POST` to verify the function is wired up.

---

## 4. Connecting the Cowork automation

The frontend never inserts articles — Cowork does, via the Supabase
REST API. Use the same publishable key you configured for the frontend
(or a separate one with the same RLS policy).

### Endpoint

```
POST https://<YOUR-PROJECT-REF>.supabase.co/rest/v1/articles
```

### Headers

The new publishable key system uses **only the `apikey` header**. Do
**not** add `Authorization: Bearer …` — that was the legacy anon-key
pattern and is unnecessary here.

```
apikey: sb_publishable_xxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
Prefer: return=representation
```

(`Prefer: return=representation` is optional — it makes Supabase echo
back the inserted row, which is handy when you want to verify a write.)

### Sample payload

```json
{
  "headline": "How the FT cracked subscriptions",
  "url": "https://www.example.com/articles/ft-subscriptions",
  "publication": "Stratechery",
  "category": "Media & Platforms",
  "summary": "A long read on the FT's pivot from ads to subs, with a tidy breakdown of the metrics that mattered."
}
```

Notes:

- `id`, `created_at`, and `status` are filled by Postgres defaults —
  you can omit them.
- `status` must be one of `new`, `reading_list`, `archived`,
  `saved_to_instapaper`. Cowork should leave it as the default
  (`new`) so the article shows up in the **Today** tab.
- `url` has a UNIQUE constraint, so duplicate submissions for the
  same article will return `409 Conflict`. Handle that gracefully in
  Cowork (treat it as a no-op).
- `category` is free-form text, but to get the matching colored pill
  use one of the canonical values: `Advertising`, `Brand & Marketing`,
  `Media & Platforms`, `Culture`, `Fashion & Beauty`, `Tech`,
  `Opinion & Essay`, `Other`. Anything else falls back to a neutral
  gray pill.

### Bulk insert (multiple articles in one digest)

Send a JSON array:

```json
[
  { "headline": "…", "url": "…", "publication": "…", "category": "Tech", "summary": "…" },
  { "headline": "…", "url": "…", "publication": "…", "category": "Culture", "summary": "…" }
]
```

Supabase REST handles `[ … ]` natively — same endpoint, same headers.

---

## 5. Layout cheat sheet

```
api/instapaper-save.ts   # serverless function; reads server-only env vars
src/
  components/            # UI building blocks
  hooks/useArticles.ts   # supabase fetch + optimistic status updates
  lib/supabase.ts        # createClient(VITE_SUPABASE_URL, …PUBLISHABLE_KEY)
  lib/categories.ts      # category → tailwind color pill
  App.tsx                # tabs, toasts, routing logic
```

## 6. Swapping Instapaper auth later

When/if you migrate from the Simple API to OAuth 1.0a, only the
`saveToInstapaper(url)` function in `api/instapaper-save.ts` needs to
change. Keep the return shape the same and the route handler — plus
the entire frontend — won't need a single edit.
