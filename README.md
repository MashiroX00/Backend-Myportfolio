# Portfolio Backend

Express + Prisma API that powers the portfolio site. Runs on the owner's local machine and is exposed to the internet via Cloudflare Tunnel.

## Stack

- **Express 4** — REST API
- **Prisma 5** — ORM + migrations (PostgreSQL)
- **jsonwebtoken** — single-owner JWT auth
- **systeminformation** — live CPU, RAM, disk metrics for the Server Status section
- **tsx** — TypeScript dev runner (no build step in development)

> ⚠️ **Do not upgrade to Prisma 7.** v7 removes `url` from `schema.prisma` and requires a different config system. Pin to v5.

## Setup

**1. Create the database**

```bash
# Inside your PostgreSQL instance:
CREATE DATABASE portfolio;
```

**2. Configure environment**

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/portfolio
OWNER_USERNAME=admin
OWNER_PASSWORD=your_secure_password
JWT_SECRET=replace-with-a-long-random-string
FRONTEND_URL=http://localhost:3000
PORT=4000
```

**3. Run migrations**

```bash
npm run db:migrate    # enter "init" when prompted for migration name
```

**4. Start**

```bash
npm run dev           # http://localhost:4000
```

## Commands

```bash
npm run dev           # start with hot-reload
npm run build         # compile to dist/
npm run start         # run compiled output
npm run db:migrate    # create + apply new migration (dev only)
npm run db:deploy     # apply pending migrations (production)
npm run db:generate   # regenerate Prisma client after schema change
npm run db:studio     # open Prisma Studio (visual DB browser)
npx tsc --noEmit      # type-check only
```

## API endpoints

All `GET` routes are public. All `POST`, `PUT`, `DELETE` routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Returns a 7-day JWT |
| `GET` | `/health` | Health check |
| `GET` | `/about` | Get about data |
| `PUT` | `/about` | Update about data |
| `GET` | `/projects` | List projects (ordered by position) |
| `POST` | `/projects` | Create project |
| `PUT` | `/projects/reorder` | Bulk reorder `[{id, position}]` |
| `PUT` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Delete project |
| `GET/POST/PUT/DELETE` | `/experience` | Same CRUD + reorder pattern |
| `GET/POST/PUT/DELETE` | `/skills` | Same CRUD + reorder pattern |
| `GET/POST/PUT/DELETE` | `/education` | Same CRUD + reorder pattern |
| `GET/POST/PUT/DELETE` | `/certificates` | Same CRUD + reorder pattern |
| `GET/POST/PUT/DELETE` | `/contact` | Contact links (no reorder) |
| `GET` | `/server-status` | Live system metrics (public) |

## Cloudflare Tunnel (production)

```bash
cloudflared tunnel create portfolio
cloudflared tunnel route dns portfolio <subdomain>.<yourdomain.com>
cloudflared tunnel run portfolio
```

Then set `FRONTEND_URL` in `.env` to your Vercel deployment URL and update `NEXT_PUBLIC_API_URL` in the frontend to the tunnel URL.

## Schema

Database schema is managed by Prisma. Source of truth: `prisma/schema.prisma`.

Models: `About` (singleton id=1), `Project`, `Experience`, `Skill`, `Education`, `Certificate`, `Contact`.

All list models have a `position: Int` column for ordered display. `tech_stack` and `titles` are stored as `JSONB`.
