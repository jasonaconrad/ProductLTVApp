# Product Revenue Pipeline Tracker

A persistent, multi-user internal tool for tracking product-driven revenue initiatives as a pipeline — Paychex Product Commercialization / Product Operations.

This app can run two ways: locally with Node + Express for development, or
live on Cloudflare (Workers + D1) for a shared multi-user deployment. Both
share the same frontend and the same API logic.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS (`client/`)
- **Local dev backend:** Node.js + Express + better-sqlite3 (`server/`)
- **Live/Cloudflare backend:** a single Worker + D1 (`worker/`, `d1/`)

## Getting started (local dev)

```bash
npm run install:all   # installs root, server, and client dependencies
npm run dev            # starts the API on :3001 and the Vite dev server on :5173
```

Open http://localhost:5173. The database is created and seeded with the initial 30 initiatives automatically the first time the server starts.

## Deploying live on Cloudflare

See [`DEPLOY.md`](./DEPLOY.md) for a click-by-click guide (no command line
needed) to host this on a Cloudflare Worker with D1 as the database and
Cloudflare Access for login.

To test the Cloudflare version locally before deploying:

```bash
npm run d1:local:init   # one-time: loads schema + seed data into a local D1 emulation
npm run worker:dev       # builds the frontend and serves it + the API together via Wrangler
```

## Project layout

```
client/   React app (src/views/*, src/components/*)
server/   Express API + SQLite schema/seed — used for local dev only
worker/   Cloudflare Worker API (D1-backed) — used for the Cloudflare deployment
d1/       schema.sql + seed.sql for setting up the D1 database
```

## Notable behavior

- Confidence scores are always recomputed server-side on save — the client only shows a live preview.
- Snapshots capture full point-in-time portfolio state and can be diffed via `/api/snapshots/compare`.
- Flags are computed on demand from current initiative + pipeline state (no separate flags table).
