import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env lives at tally/.env (next to docker-compose.yml)
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3081;
const TALLY_BASE_URL = (process.env.TALLY_BASE_URL || 'https://api.tally.so').replace(/\/+$/, '');
const TALLY_API_KEY = process.env.TALLY_API_KEY;

if (!TALLY_API_KEY) {
  console.error('ERROR: TALLY_API_KEY environment variable is required');
  console.error('Create one at https://tally.so/settings/api-keys and put it in tally/.env');
  process.exit(1);
}

// Tally rate-limits to 100 requests/minute. A short TTL cache keeps repeated
// pull-to-refresh taps from burning that budget, while still feeling live.
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 10000);
const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.body;
  if (hit) cache.delete(key);
  return null;
}

function cacheSet(key, body) {
  // Cheap bound: drop expired entries once the map gets large.
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) if (now - v.at >= CACHE_TTL_MS) cache.delete(k);
  }
  cache.set(key, { at: Date.now(), body });
}

async function tally(path, search = {}, { noCache = false } = {}) {
  const url = new URL(TALLY_BASE_URL + path);
  for (const [k, v] of Object.entries(search)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const key = url.toString();

  if (!noCache) {
    const cached = cacheGet(key);
    if (cached) return cached;
  }

  const res = await fetch(key, {
    headers: {
      Authorization: `Bearer ${TALLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text };
  }

  if (!res.ok) {
    const err = new Error(body?.message || body?.error || `Tally API returned ${res.status}`);
    err.status = res.status;
    throw err;
  }

  cacheSet(key, body);
  return body;
}

app.use(express.json());

// Serve the built PWA in production
app.use(express.static(join(__dirname, '..', 'frontend', 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, baseUrl: TALLY_BASE_URL });
});

// Who the API key belongs to - shown in the app header
app.get('/api/me', async (req, res, next) => {
  try {
    res.json(await tally('/users/me'));
  } catch (e) {
    next(e);
  }
});

// All forms, across every page (Tally caps limit at 500)
app.get('/api/forms', async (req, res, next) => {
  try {
    const forms = [];
    let page = 1;
    let total = 0;

    // Guard against runaway pagination; 5 pages = 2500 forms
    while (page <= 5) {
      const body = await tally('/forms', { page, limit: 500 });
      const items = body.items || body.forms || [];
      forms.push(...items);
      total = body.total ?? forms.length;
      if (!body.hasMore || items.length === 0) break;
      page += 1;
    }

    res.json({ forms, total });
  } catch (e) {
    next(e);
  }
});

app.get('/api/forms/:formId', async (req, res, next) => {
  try {
    res.json(await tally(`/forms/${encodeURIComponent(req.params.formId)}`));
  } catch (e) {
    next(e);
  }
});

// Submissions for one form, with the question list needed to label answers.
// Shape is normalised so the frontend only has to understand one thing.
app.get('/api/forms/:formId/submissions', async (req, res, next) => {
  try {
    const { page = 1, limit = 25, filter = 'all' } = req.query;
    const body = await tally(`/forms/${encodeURIComponent(req.params.formId)}/submissions`, {
      page,
      limit,
      filter,
    });

    const questions = (body.questions || []).map((q) => ({
      ...q,
      // REST uses `title`, the MCP layer uses `label` - accept either
      title: q.title ?? q.label ?? '',
    }));

    res.json({
      page: body.page ?? Number(page),
      limit: body.limit ?? Number(limit),
      hasMore: Boolean(body.hasMore),
      counts: body.totalNumberOfSubmissionsPerFilter ||
        body.counts || { all: null, completed: null, partial: null },
      questions,
      submissions: body.submissions || [],
    });
  } catch (e) {
    next(e);
  }
});

// Unknown API routes should 404 as JSON, not fall through to index.html
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('Proxy error:', err.message);
  res.status(status).json({ error: err.message || 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`Tally Mobile proxy listening on :${PORT} -> ${TALLY_BASE_URL}`);
});
