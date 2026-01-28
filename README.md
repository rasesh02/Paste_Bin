# Pastebin-Lite

Share text and code snippets securely with optional expiration (TTL) and max view limits. This project includes a React + Vite frontend and a Node.js/Express backend backed by MongoDB via Mongoose.

## Run Locally

Prerequisites:
- Node.js 20+ and npm
- MongoDB (local or Atlas)

1) Backend
- Copy the example env and edit values:
  - `cp backend/.env.example backend/.env`
- Install deps and start the API:
  - `cd backend`
  - `npm install`
  - `node src/index.js`
- The API listens on `http://localhost:5000` by default.

2) Frontend
- Create a local env file for the API base (optional, defaults to localhost):
  - `cp frontend/.env.local.example frontend/.env.local`
- Install deps and start the dev server:
  - `cd frontend`
  - `npm install`
  - `npm run dev`
- Open `http://localhost:5173` in your browser.

## Persistence Layer
- MongoDB with Mongoose ODM.
- Collection: `pastes`
- Fields: `content` (string), `maxViews` (number|null), `views` (number), `expiresAt` (Date|null), `createdAt` (Date).

## Important Design Decisions
- Validation at the edge: The API enforces `content` as non-empty string, and `ttl_seconds`/`max_views` as integers ≥ 1.
- Expiration + burn limits: Retrieval endpoints atomically increment `views` using `findOneAndUpdate` with a compound filter that ensures:
  - Not expired: `expiresAt` is null or in the future.
  - Not exhausted: `maxViews` is null or `views < maxViews` (via `$expr`).
  This guarantees single-pass consistency under concurrency.
- Link building: The backend constructs shareable links from `BASE_URL` when set; otherwise infers from the incoming request (proto + host). This eases deployment behind proxies.
- Two consumption modes:
  - JSON API: `GET /api/pastes/:id` returns content and metadata (remaining views, expiry).
  - HTML view: `GET /p/:id` renders a minimal HTML page with escaped content.
- CORS: Development CORS allows `http://localhost:5173`. For production, set `CORS_ORIGIN` and remove dev-only overrides.
- Frontend API base: Uses `VITE_API_BASE_URL` at build time; falls back to `http://localhost:5000` during development.

## Environment Variables

Backend (`backend/.env`):
- `MONGODB_URL` (required): MongoDB connection string.
- `PORT` (optional): API port (default 5000).
- `CORS_ORIGIN` (recommended): Allowed frontend origin (e.g., `http://localhost:5173`).
- `BASE_URL` (optional): Public base URL used in generated links (e.g., `https://your-domain.com`).

Frontend (`frontend/.env.local`):
- `VITE_API_BASE_URL` (optional): API base like `http://localhost:5000`.

## API Summary
- `GET /api/healthz` → `{ ok: boolean }`
- `POST /api/pastes` → `{ id, url }`
  - body: `{ content: string, ttl_seconds?: number, max_views?: number }`
- `GET /api/pastes/:id` → `{ content, remaining_views, expires_at }` (404 if expired/exhausted)
- `GET /p/:id` → Minimal HTML page with the paste content

## Notes & Next Steps
- Do not commit secrets. Use `.env` files and keep them gitignored.
- Consider adding rate limiting and content size limits for abuse prevention.
- For production, set `BASE_URL`, tighten CORS, and serve the frontend behind a reverse proxy.

---

Made with React, Vite, Express, and MongoDB.
