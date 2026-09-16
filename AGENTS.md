# Agent Instructions

## Package Manager & Workspace
- Package manager: **npm** (version >= 8.0.0, Node.js >= 20.0.0, recommended Node 22+)
- Monorepo structure using **npm workspaces**: `backend`, `frontend`
- Install all dependencies from root: `npm install` (DO NOT run nested installs or add postinstall scripts)

## Canonical Commands
| Task | Command | Scope |
|---|---|---|
| Development (Fullstack) | `npm run dev` | Concurrently runs backend (3000) & frontend Vite (5173) |
| Backend Dev | `npm run dev:backend` | `node --watch backend/server.js` |
| Frontend Dev | `npm run dev:frontend` | Vite dev server |
| Production Build | `npm run build` | `tsc -b && vite build` (target: `frontend/dist`) |
| Start Production | `npm start` | Builds frontend & starts Express on port 3000 |
| Lint | `npm run lint` | `oxlint` on `frontend/` |
| Typecheck | `npx tsc --noEmit -p frontend/tsconfig.app.json` | Frontend TypeScript check |

## Architecture & Data Flow
- **Dual-Mode Deployment**:
  - **Local Stand Mode (Offline)**: Express (`backend/server.js`) + SQLite (`backend/db.js`). Database file: `backend/hima_games.sqlite`.
  - **Static Cloud Mode (GitHub Pages)**: Client-side interceptor (`frontend/src/lib/apiFallback.ts`) intercepts `/api/*` and persists to `localStorage`. Pre-seeded with 34 official pengurus.
- **Static Assets**:
  - All pengurus photos live in `backend/uploads/` AND `frontend/public/uploads/` for zero-404 GitHub Pages static serving.
  - Custom domain configured in `frontend/public/CNAME`: `minigames.jaydev.my.id`.
- **CI/CD**:
  - Deployment workflow: `.github/workflows/deploy.yml` builds and deploys `frontend/dist` to GitHub Pages.

## Coding Conventions
- **Frontend**:
  - React 19 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`).
  - Animating cards: Use Framer Motion (`framer-motion`).
  - Sound synthesis: Use Web Audio API in `frontend/src/lib/soundEffects.ts` (no external MP3 assets).
  - Icons: Use `lucide-react`.
- **Backend**:
  - ES Modules (`"type": "module"`).
  - Database: Use `node:sqlite` (Node 22.5+) with `better-sqlite3` fallback in `backend/db.js`.
  - Port fallback: Handle `EADDRINUSE` gracefully, respect `process.env.PORT` or `.env`.
- **Git**:
  - Never commit `backend/package-lock.json` or `frontend/package-lock.json`. Only root `package-lock.json` is tracked.
  - Never commit `.sqlite`, `.db`, or `.env`.
