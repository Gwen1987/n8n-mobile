# n8n Mobile Command Center

## Project Overview

Mobile-friendly PWA to manage my self-hosted n8n instance. React frontend + Express proxy backend, deployed via Docker on my existing jacoserver infrastructure.

## Architecture

- **Frontend**: React PWA (mobile-first, dark theme, add-to-homescreen)
- **Backend**: Express proxy that holds the n8n API key server-side
- **Deployment**: Docker container added to existing docker-compose on jacoserver
- **Access**: Via Cloudflare Tunnel (already configured on jacoserver)

## Infrastructure Context

- Server: Dell Optiplex running Ubuntu 24.04
- Docker + docker-compose already running n8n, Pi-hole, n8n workflows
- Cloudflare Tunnels for external access
- Tailscale for internal access
- n8n is already running in Docker on this server

## Security Requirements

- n8n API key stored in .env file ONLY, never in frontend code
- .env added to .gitignore
- Express proxy reads API key from process.env.N8N_API_KEY
- Frontend talks to proxy, proxy talks to n8n API
- Proxy and frontend served from same origin to avoid CORS

## Tech Stack

- Node.js + Express for proxy
- React (Vite) for frontend
- Docker for deployment
- No database needed

## n8n API Endpoints to Proxy

All under /api/v1, authenticated with X-N8N-API-KEY header:

- GET /workflows - list all workflows
- GET /workflows/:id - get workflow details
- POST /workflows/:id/activate - activate workflow
- POST /workflows/:id/deactivate - deactivate workflow
- GET /executions - list recent executions
- GET /executions/:id - execution details
- POST to webhook URLs - trigger webhook workflows

## Frontend Features (v1)

1. Workflow list with active/inactive toggle
1. Filter by status (all/active/inactive)
1. Trigger webhook workflows with a tap
1. Execution history with status indicators
1. Pull-to-refresh
1. Add-to-homescreen PWA support

## Design Direction

- Dark theme (slate/indigo palette)
- Monospace typography (JetBrains Mono)
- Mobile-first, touch-friendly tap targets
- Minimal chrome, dense but readable

## File Structure

```
n8n-mobile/
  frontend/
    src/
      App.jsx
      main.jsx
    index.html
    vite.config.js
    package.json
  backend/
    server.js
    package.json
  .env              # N8N_API_KEY and N8N_BASE_URL
  .env.example       # template without real values
  .gitignore
  Dockerfile
  docker-compose.yml
  CLAUDE.md
```

## .env Variables

```
N8N_API_KEY=your-key-here
N8N_BASE_URL=http://n8n:5678
PORT=3080
```

Note: N8N_BASE_URL uses the Docker internal hostname since proxy and n8n are on the same Docker network.

## Commands

- `npm run dev` - dev mode (from frontend/)
- `docker compose up --build` - build and run
- `docker compose up -d` - run detached

## Conventions

- Keep it simple, single-file components where possible
- No TypeScript for v1
- Minimal dependencies
- Comments for anything non-obvious
