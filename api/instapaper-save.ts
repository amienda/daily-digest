import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Server-side handler for saving an article to Instapaper.
 *
 * Architectural contract:
 *  - INSTAPAPER_USERNAME / INSTAPAPER_PASSWORD are read here only.
 *  - Credentials are NEVER returned to the client, logged, or echoed
 *    back in error messages.
 *  - The auth-bearing call is isolated in `saveToInstapaper()` so a
 *    later swap to OAuth 1.0a is a single-file change with the same
 *    return shape.
 */

interface SaveResult {
  ok: boolean;
  status: number;
  error?: string;
}

async function saveToInstapaper(url: string): Promise<SaveResult> {
  const username = process.env.INSTAPAPER_USERNAME;
  const password = process.env.INSTAPAPER_PASSWORD;

  if (!username || !password) {
    return { ok: false, status: 500, error: 'Instapaper credentials are not configured on the server.' };
  }

  // Basic auth keeps credentials out of any URL string a network proxy
  // or log line might capture. Body carries only the article URL.
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  const body = new URLSearchParams({ url }).toString();

  let upstream: Response;
  try {
    upstream = await fetch('https://www.instapaper.com/api/add', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/plain',
      },
      body,
    });
  } catch {
    // Network error — don't surface low-level details to the client.
    return { ok: false, status: 502, error: 'Could not reach Instapaper.' };
  }

  // Instapaper Simple API returns 201 on add, 200 on already-bookmarked.
  if (upstream.status === 201 || upstream.status === 200) {
    return { ok: true, status: upstream.status };
  }
  if (upstream.status === 400) {
    return { ok: false, status: 400, error: 'Instapaper rejected the request (bad URL).' };
  }
  if (upstream.status === 403) {
    return { ok: false, status: 502, error: 'Instapaper authentication failed.' };
  }
  return {
    ok: false,
    status: 502,
    error: `Instapaper returned an unexpected status (${upstream.status}).`,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Reject calls that don't carry the app secret (set APP_SECRET in Vercel env vars).
  // If APP_SECRET is not configured the check is skipped so deploys without it still work.
  const expectedSecret = process.env.APP_SECRET;
  const sentSecret = req.headers['x-app-secret'];
  if (expectedSecret && sentSecret !== expectedSecret) {
    return res.status(403).json({ success: false, error: 'Forbidden.' });
  }

  // Vercel parses JSON bodies automatically when Content-Type is application/json.
  const body = (req.body ?? {}) as { url?: unknown };
  const url = typeof body.url === 'string' ? body.url.trim() : '';

  if (!url) {
    return res.status(400).json({ success: false, error: 'Missing or invalid `url`.' });
  }
  // Basic sanity check — accept only http(s) URLs.
  if (!/^https?:\/\/\S+$/i.test(url)) {
    return res.status(400).json({ success: false, error: 'URL must be a valid http(s) link.' });
  }

  const result = await saveToInstapaper(url);

  // Intentionally minimal logging — no credentials, no URLs.
  // eslint-disable-next-line no-console
  console.log(`[instapaper-save] result=${result.ok ? 'ok' : 'fail'} status=${result.status}`);

  if (result.ok) {
    return res.status(200).json({ success: true });
  }
  return res
    .status(result.status >= 400 && result.status < 600 ? result.status : 502)
    .json({ success: false, error: result.error ?? 'Save failed.' });
}
