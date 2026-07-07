# Product Revenue Pipeline Tracker

A persistent, multi-user internal tool for tracking product-driven revenue initiatives as a pipeline — Paychex Product Commercialization / Product Operations.

## Stack

- **Backend:** Node.js + Express + better-sqlite3 (`server/`)
- **Frontend:** React (Vite) + Tailwind CSS (`client/`)
- **Database:** SQLite, single file at `server/pipeline.db` (auto-created and seeded on first run)

## Getting started

```bash
npm run install:all   # installs root, server, and client dependencies
npm run dev            # starts the API on :3001 and the Vite dev server on :5173
```

Open http://localhost:5173. The database is created and seeded with the initial 30 initiatives automatically the first time the server starts.

## Project layout

```
server/   Express API + SQLite schema/seed (src/db.js, src/routes/*)
client/   React app (src/views/*, src/components/*)
```

## Notable behavior

- Confidence scores are always recomputed server-side on save — the client only shows a live preview.
- Snapshots capture full point-in-time portfolio state and can be diffed via `/api/snapshots/compare`.
- Flags are computed on demand from current initiative + pipeline state (no separate flags table).
