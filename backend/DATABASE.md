# Database — Aqsa Physiotherapy Centre

PostgreSQL, managed through Prisma. This document is the database-specific companion to [README.md](README.md) — read that first for the full backend picture; this covers just the data layer in depth.

## Database architecture

Three tables, no medical-record fields — this system manages appointment requests and contact messages, not clinical records.

**`admin_users`** (Prisma model `AdminUser`)
Staff accounts for the admin API. `email` unique, `passwordHash` (bcrypt, 12 rounds — plaintext is never stored or logged), `role` (`ADMIN` | `SUPER_ADMIN`) for role-based checks, `isActive` to disable an account without deleting it, `lastLoginAt` updated on every successful login. No JWTs are stored in the database — sessions are stateless signed tokens (see `backend/src/utils/jwt.ts`), verified against `isActive` on every request rather than looked up in a session table.

**`appointments`** (Prisma model `Appointment`)
One row per appointment request: `patientName`, `phone`, `email` (optional), `preferredDate` (date-only), `preferredTime` (`HH:mm` string), `service`, `message` (optional), `status` (`PENDING` → `CONFIRMED`/`CANCELLED` → `COMPLETED`/`NO_SHOW`), `adminNotes` (private, never returned by any public endpoint). Every new row starts `PENDING` — nothing is ever auto-confirmed.

**`contact_messages`** (Prisma model `ContactMessage`)
General inquiries, kept deliberately separate from appointments rather than folded in as an appointment type. `status` (`NEW` → `READ`/`REPLIED`/`ARCHIVED`).

**No relations between the three tables.** An appointment doesn't reference an admin or a specific provider — the clinic currently has no concept of assigning a specific physiotherapist to a slot. If that's needed later (e.g. "Dr. Sahil's Tuesday slots"), the natural extension is an optional `assignedAdminId` foreign key on `Appointment` — deliberately not built now since it isn't used by anything today and would just be an unused column.

## Setup

```bash
# 1. Create the database (adjust user/password to match your local Postgres)
psql -U postgres -c "CREATE DATABASE aqsa_physio;"

# 2. Point Prisma at it
cd backend
cp .env.example .env   # then edit DATABASE_URL/DIRECT_URL if they differ from the default
```

Default local connection string (matches a fresh `postgres`/`postgres` install) — `DATABASE_URL` and `DIRECT_URL` are the same value for local development:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aqsa_physio?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/aqsa_physio?schema=public"
```

## Environment

Two connection variables:

- **`DATABASE_URL`** — used by the running app (Prisma Client) for every query.
- **`DIRECT_URL`** — used only by the Prisma CLI (`migrate`, `studio`), never at app runtime.

For a plain local/Docker Postgres, both are the same value — there's no pooler in front, so there's nothing to distinguish. They start diverging once you deploy to a connection-pooled provider like **Neon** or **Supabase**: `DATABASE_URL` becomes the *pooled* (PgBouncer) connection string the app uses under normal load, while `DIRECT_URL` stays an *unpooled* connection, because running schema migrations through a transaction-mode pooler can fail or behave unexpectedly. See [../DEPLOYMENT.md](../DEPLOYMENT.md) for exactly which connection string goes where on Neon/Supabase.

## Migrations

```bash
# Development — creates a new migration from schema changes and applies it
npm run prisma:migrate

# Production — applies existing migrations, creates none
npm run prisma:migrate:deploy
```

Migration files live in `backend/prisma/migrations/`, one timestamped folder per migration, each with a `migration.sql`. **Never hand-edit or delete an applied migration** — if the schema needs to change, run `prisma migrate dev` again to generate a new one. `prisma db push` is intentionally not part of the workflow — it skips the migration history entirely, which is fine for prototyping but not for a database anyone will run in production.

Current migration: `20260831154832_init` — creates all three tables, three enums (`AdminRole`, `AppointmentStatus`, `ContactStatus`), and every index listed below.

## Indexes

| Table | Indexes | Why |
|---|---|---|
| `admin_users` | `email` (unique) | Login lookup |
| `appointments` | `preferredDate`, `status`, `phone`, `email`, `createdAt`, `(preferredDate, preferredTime)` | Match the actual admin filters (`?status=`, `?date=`, `?search=` on phone/email) and the availability check's per-slot lookup |
| `contact_messages` | `status`, `createdAt`, `email` | Match admin filters and default sort order |

No indexes were added beyond what the current queries in `appointment.service.ts` / `contact.service.ts` / `availability.service.ts` actually use.

## Seed

```bash
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first
npm run prisma:seed
```

`prisma/seed.ts` creates exactly one admin account, using `ADMIN_EMAIL`/`ADMIN_PASSWORD` from the environment — never hardcoded. It's safe to run repeatedly: it checks for an existing account with that email first and skips (no upsert-overwrite of an existing password, so a re-run can't silently reset credentials). The plaintext password is hashed with bcrypt before the insert and is never logged.

**Change the seeded password after first login** — it's a placeholder value meant to get you into the system once, not a credential to keep using.

No fake appointments or contact messages are seeded — this script creates the one admin account and nothing else, per the "don't insert fake patient data" rule for a healthcare-adjacent system. If you want sample data for local UI testing, create it manually and delete it when done — don't add it to the seed script.

## Prisma Studio

```bash
npm run prisma:studio
```

Opens a local browser GUI to inspect/edit `AdminUser`, `Appointment`, and `ContactMessage` rows directly. **Local development only** — it binds to localhost and has no auth of its own, so it must never be exposed on a production host or network.

## Backup & restore

Not automated by this project — that would be a false promise on a local/self-managed Postgres instance. Use Postgres's own tooling:

```bash
# Backup (custom format, compressed)
pg_dump -U postgres -h localhost -Fc aqsa_physio -f aqsa_physio_$(date +%Y%m%d).dump

# Restore into a fresh/empty database
createdb -U postgres aqsa_physio_restored
pg_restore -U postgres -h localhost -d aqsa_physio_restored aqsa_physio_20260831.dump
```

If you deploy to a managed Postgres provider (RDS, Neon, Supabase, Railway, etc.), use **their** automated backup feature instead of relying on manual `pg_dump` — most offer point-in-time recovery out of the box, which a manual dump schedule can't match. Whichever you use, periodically test an actual restore — an untested backup is not a verified backup.

## Security — what must never be committed or exposed

- `backend/.env` — real `DATABASE_URL`, `JWT_SECRET`, admin seed credentials, `RESEND_API_KEY`. Already covered by `.gitignore` (`.env`, `.env.*`, `!.env.example`).
- `passwordHash` — never included in any API response (verified: login and `/me` responses only ever construct a plain object with `id`/`name`/`email`/`role`, never the raw Prisma row).
- `adminNotes` — only reachable through authenticated `/api/admin/*` routes; no public endpoint returns it.
- Raw Prisma/Postgres error messages — the centralized error handler (`backend/src/middleware/errorHandler.ts`) never forwards a raw driver error to the client; unexpected errors become a generic "Something went wrong" outside development.
- `DATABASE_URL` itself — never sent to the frontend, never logged (pino's redact list in `backend/src/config/logger.ts` covers auth headers/cookies/passwords, and nothing in the codebase logs the connection string).

## Health check

`GET /api/health` — process liveness only, no DB touched.
`GET /api/health/ready` — runs `SELECT 1` through Prisma; returns 500 if the database is unreachable, without leaking connection details in the response body.

## Performance notes

- Every admin list endpoint (`/api/admin/appointments`, `/api/admin/messages`) is paginated (`page`/`limit`, capped at 100 per page) — there is no way to request an unbounded result set.
- List + count run as a single `prisma.$transaction([...])` per request — two queries, not N+1.
- The availability endpoint does one `findMany` for the target date's bookings, not one query per slot.
