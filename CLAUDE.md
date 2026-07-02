# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # start with hot-reload (tsx watch) on port 4000
npm run build         # compile to dist/
npm run start         # run compiled dist/index.js
npm run db:migrate    # create and apply a new migration (dev only)
npm run db:deploy     # apply pending migrations (production)
npm run db:generate   # regenerate Prisma client after schema change
npm run db:studio     # open Prisma Studio (visual DB browser)
```

Type-check:
```bash
npx tsc --noEmit
```

## Setup

1. Copy `.env.example` → `.env` and fill in all values.
2. Create the PostgreSQL database: `createdb portfolio`
3. Run migrations: `npm run db:migrate` (names the migration, e.g. `init`)
4. Start: `npm run dev`

## Stack

- **Express 4** + TypeScript (`commonjs` module, `ES2020` target)
- **Prisma 5** — ORM + migrations; schema at `prisma/schema.prisma`; client singleton in `src/db.ts`
- **jsonwebtoken** — JWT for auth (single owner, no user table)
- **systeminformation** — cross-platform system metrics (CPU, RAM, disk, OS)
- **cors** — configured from `FRONTEND_URL` env var (comma-separated)
- **tsx** — TypeScript dev runner (no build step needed in development)
- **graphql-request** — minimal GraphQL client, used to query GitHub's Contributions Collection API
- **nodemailer** — sends the CV/Resume email via Gmail SMTP (`GMAIL_USER` / `GMAIL_APP_PASSWORD`)

## Architecture

### Entry point

`src/index.ts` — loads `.env`, mounts all routers, starts server.

### Auth model

Single-owner. `POST /auth/login` checks `OWNER_USERNAME` from ENV and the password against `OWNER_PASSWORD_HASH` (bcrypt, via `bcryptjs`), returns a 1-day JWT (HS256, pinned on verify). Login is rate limited (5 attempts / 15 min per IP). All mutating routes (`POST`, `PUT`, `DELETE`) require `Authorization: Bearer <token>` via `src/middleware/auth.ts`. `GET` routes are public. Startup fails fast if `DATABASE_URL`, `OWNER_USERNAME`, `OWNER_PASSWORD_HASH`, or `JWT_SECRET` is missing. All route inputs are validated via `src/lib/validate.ts` (length limits, http(s)-only URLs). Set `TRUST_PROXY_HOPS=1` when deployed behind a reverse proxy so per-IP rate limiting sees real client IPs.

### Route structure

| Mount | File | Notes |
|---|---|---|
| `GET/PUT /about` | `routes/about.ts` | Singleton (id=1), Prisma upsert on PUT |
| `CRUD /projects` | `routes/projects.ts` | + `PUT /projects/reorder` |
| `CRUD /experience` | `routes/experience.ts` | + `PUT /experience/reorder` |
| `CRUD /skills` | `routes/skills.ts` | + `PUT /skills/reorder` |
| `CRUD /education` | `routes/education.ts` | + `PUT /education/reorder` |
| `CRUD /certificates` | `routes/certificates.ts` | + `PUT /certificates/reorder` |
| `GET/POST/PUT/DELETE /contact` | `routes/contact.ts` | No reorder |
| `GET /github-activity` | `routes/github-activity.ts` | Public; proxies GitHub GraphQL contribution calendar via `lib/github.ts`, 1hr in-memory cache. Requires `GITHUB_TOKEN` + `GITHUB_USERNAME`. |
| `POST /cv-request` | `routes/cv-request.ts` | Public; Visitor submits `{email}`, emails them `About.cv_url` via `lib/mailer.ts`. Per-IP rate limited (3 / 15min). Requires `GMAIL_USER` + `GMAIL_APP_PASSWORD`. |
| `POST /messages`, `GET /messages`, `PUT /messages/:id/read` | `routes/messages.ts` | One-way DM inbox from the Contact section: `POST` (public, rate limited 3/15min) submits `{name, message}`; `GET`/`PUT .../read` (auth) list/mark-read for the Admin UI Messages tab. No reply/email address is collected — Owner cannot respond through the system. |
| `POST /auth/login` | `routes/auth.ts` | Returns JWT |
| `GET /health` | inline in index.ts | Always returns `{status:"ok"}` |

### Reorder pattern

`PUT /<resource>/reorder` accepts `[{id, position}]` and updates all rows in a single `prisma.$transaction([...])`.

### Prisma schema notes

- `About.id` has no `@default` — always created with `id: 1` via upsert.
- `About.cv_url` is a plain externally-hosted URL (same convention as `photo_url`, e.g. a Google Drive link) — no file upload exists in this repo.
- `Certificate.date_issued` uses `@db.Date` (PostgreSQL `DATE` type). Input must be parseable by `new Date()`.
- `Project.tech_stack` and `About.titles` are `Json` (JSONB in PostgreSQL). Prisma returns these as `JsonValue`; no manual `JSON.stringify` needed on write.
- **Never run `prisma migrate dev` in production** — use `npm run db:deploy` instead.
- `Message.read` defaults to `false`; the Admin UI marks it `true` via `PUT /messages/:id/read` when the Owner opens it. No delete route exists — messages are permanent.

