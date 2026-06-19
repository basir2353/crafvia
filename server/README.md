# Crafvia API

Production backend for the Crafvia frontend.

## Features

- JWT authentication (register, login, refresh, logout)
- Pro subscription checkout (Stripe-ready, demo mode included)
- Tool catalog (170+ tools) with search and categories
- Image, JPG, and PDF compression with usage limits
- Processing job tracking and live stats
- Content pages (pricing, privacy, terms, about, FAQ)
- Rate limiting, Helmet security headers, Zod validation

## Prerequisites

- Node.js 22+
- PostgreSQL 16+ (local install or Docker)

## Quick start

### 1. Start PostgreSQL

**Option A — Docker (recommended):**

```bash
# From project root
docker compose up postgres -d
```

**Option B — Local PostgreSQL on port 5432:**

Create the database and user:

```sql
CREATE DATABASE crafvia;
CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;
```

Or use your own credentials and update `DATABASE_URL` accordingly.

### 2. Configure and run the API

```bash
cd server
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

API runs at `http://localhost:3001`.

> **Port note:** The standard connection string uses port **5432**. Docker Compose maps PostgreSQL to host port **5433** when a local PostgreSQL service already occupies 5432 (common on Windows). Use `localhost:5433` in `server/.env` for Docker-based development, or stop the local PostgreSQL service and use port 5432 everywhere.

## Environment

See `.env.example` for all variables. Required:

- `DATABASE_URL` — PostgreSQL connection string, e.g.  
  `postgresql://postgres:postgres@localhost:5432/crafvia?schema=public`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — min 32 characters each
- `CORS_ORIGIN` — frontend URL (e.g. `http://localhost:5173`)

## Database commands

```bash
# Apply migrations and seed (first run / CI)
npm run db:setup

# Create a new migration during development
npm run db:migrate

# Apply migrations only (production)
npm run db:migrate:deploy

# Seed data only
npm run db:seed
```

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Current user (auth required) |
| GET | `/api/tools` | List tools |
| GET | `/api/tools/search?q=` | Search tools |
| GET | `/api/tools/categories` | List categories |
| GET | `/api/tools/:slug` | Tool details |
| GET | `/api/stats` | Public statistics |
| GET | `/api/config` | Site config (donate URL, etc.) |
| GET | `/api/subscriptions/plans` | Pricing plans |
| POST | `/api/subscriptions/checkout` | Start Pro checkout |
| GET | `/api/content/pages/:slug` | Static content |
| POST | `/api/compress/image` | Compress image |
| POST | `/api/compress/jpg` | Compress JPG |
| POST | `/api/compress/pdf` | Compress PDF |
| GET | `/api/compress/limits` | Plan limits |

## Deployment

### Docker (full stack)

From project root:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- PostgreSQL: `localhost:5432` (user/password/db: `postgres`/`postgres`/`crafvia`)

Migrations run automatically on API container startup.

### PDF compression

PDF compression requires Ghostscript (`gs` / `gswin64c`). The Docker image includes it. On Windows, install from [ghostscript.com](https://ghostscript.com/releases/gsdnld.html).
