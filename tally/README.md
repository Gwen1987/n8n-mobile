# Tally Mobile

Tally has no mobile app. This is one: a home-screen PWA for reading your Tally
forms and their submissions from your phone.

Same shape as the n8n Command Center in the parent folder — an Express proxy
that holds the API key server-side, and a React PWA served from the same
origin, so there is no CORS and the key never reaches the browser.

## What it does (v1)

- **Forms list** — every form with its live submission count, status
  (published / draft), closed flag, and when it was last updated. Filter by status.
- **Submissions** — tap a form to read its responses, newest first. Filter by
  all / completed / partial.
- **Readable answers** — each submission expands into question-and-answer order
  (the API returns answers in arbitrary order; the app re-sorts them to match
  the form). Choice answers render as labels even when the API returns option
  ids, files and links are tappable, emails open the mail app, phone numbers
  dial, payments show as `250 CAD`. A `raw` toggle shows the underlying JSON
  for anything unusual.
- **Pull to refresh**, plus a tap-to-refresh at the bottom of the list.

Read-only by design: nothing in this app can edit, close, or delete a form or
a submission.

## Setup

1. Create an API key at <https://tally.so/settings/api-keys>. It is shown once.
2. `cp .env.example .env` and paste the key into `TALLY_API_KEY`.
3. `docker compose up --build -d`
4. Open `http://<server>:3081` and use "Add to Home Screen".

`.env` is gitignored — the key never leaves the server.

## Local development

```bash
cd backend && npm install && npm run dev      # proxy on :3081
cd frontend && npm install && npm run dev     # Vite on :5173, proxies /api
```

## Deployment notes

- Runs on port **3081** (n8n-mobile uses 3080), so both can run side by side.
- The compose file joins the external `n8n-network` so cloudflared can route to
  `http://tally-mobile:3081` by container name. If your tunnel points at the
  published host port instead, you can drop that block.
- Unlike n8n-mobile, this container talks to the public internet
  (`api.tally.so`), not to another container.

## API notes

- Tally's API is `https://api.tally.so`, authenticated with
  `Authorization: Bearer <key>`, and rate-limited to **100 requests/minute**.
- The proxy caches each upstream response for `CACHE_TTL_MS` (default 10s) so
  repeated refreshes don't eat that budget.
- Endpoints used: `GET /users/me`, `GET /forms`,
  `GET /forms/{id}/submissions?page&limit&filter`.
- Tally recommends webhooks over polling for instant notification of new
  submissions — worth adding later if you want alerts rather than a pull.

## Proxy endpoints

| Route | Purpose |
| --- | --- |
| `GET /api/health` | liveness + which upstream is configured |
| `GET /api/me` | the key's owner, shown in the header |
| `GET /api/forms` | all forms, every page merged |
| `GET /api/forms/:id` | one form with blocks and settings |
| `GET /api/forms/:id/submissions` | submissions + questions, normalised |
