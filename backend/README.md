# Aqsa Physiotherapy Centre — Backend API

Production-ready backend for the [Aqsa Physiotherapy Centre frontend](../README.md): appointment requests, contact messages, and admin management. Node.js + TypeScript + Express + PostgreSQL (Prisma) + JWT auth.

This is a separate project from the frontend — it has its own `package.json`, `node_modules`, and lifecycle. Nothing here is imported by the frontend build; the two only talk over HTTP.

See [DATABASE.md](DATABASE.md) for the database schema, migrations, seeding, backup strategy, and security notes in depth.

## 1. Requirements

- Node.js 20+
- PostgreSQL 14+ (or Docker, see below)
- npm

## 2. Install

```bash
cd backend
npm install
```

## 3. PostgreSQL setup

**Option A — Docker (recommended for local dev):**

```bash
docker compose up -d db
```

Starts Postgres on `localhost:5432` with user/password `postgres` and database `aqsa_physio` (matches the default `DATABASE_URL` in `.env.example`).

**Option B — Existing local/remote PostgreSQL:** create a database and point `DATABASE_URL` at it.

## 4. Environment variables

```bash
cp .env.example .env
```

Then fill in `.env`. See `.env.example` for the full list with comments; the essentials:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Long random string signing admin sessions — generate with `openssl rand -hex 32` |
| `FRONTEND_URL` | Exact origin(s) allowed by CORS, comma-separated |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by the seed script to create the first admin account |
| `RESEND_API_KEY` / `EMAIL_FROM` / `CLINIC_NOTIFICATION_EMAIL` | Optional — leave blank to disable email notifications entirely |
| `CLINIC_*` | Clinic hours/timezone used by the availability endpoint — placeholders, see [../CLAUDE.md](../CLAUDE.md) |

Never commit `.env`. `.gitignore` already excludes it.

## 5. Prisma setup & migration

```bash
npm run prisma:generate
npm run prisma:migrate     # creates the database schema (dev migration)
```

For deploying an existing migration history to a fresh environment instead of creating new migrations:

```bash
npm run prisma:migrate:deploy
```

## 6. Seed the first admin account

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then:

```bash
npm run prisma:seed
```

Safe to re-run — it skips if that email already exists rather than overwriting anything. Change the password after first login; nothing about the seed password is stored anywhere except the hash in the database.

## 7. Development

```bash
npm run dev
```

Starts the API on `http://localhost:5000` (or `PORT` from `.env`) with auto-reload. API docs at `http://localhost:5000/api/docs` (Swagger UI, enabled outside production or with `ENABLE_API_DOCS=true`).

## 8. Testing

```bash
npm run test
```

Runs the Vitest suite (`tests/`) against a **mocked Prisma client** — no real database required. Covers: appointment validation (valid/invalid/missing fields/invalid email/invalid date/unknown service/duplicate slot), admin auth (login success/failure, protected-route access, unauthenticated/invalid-token rejection), admin status updates, contact form validation, and rate limiting.

This does not replace testing against a real Postgres instance before deploying — run through [section 14 below](#14-manual-end-to-end-check) with `docker compose up -d db` and the real app once real infrastructure is available.

## 9. Production build

```bash
npm run build   # compiles TypeScript to dist/
npm run start   # runs the compiled server (node dist/server.js)
```

The server listens on `process.env.PORT` (falls back to `5000` locally).

## 10. API endpoints

Base URL: `/api`. Full interactive reference at `/api/docs`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| GET | `/health/ready` | — | Liveness + DB connectivity |
| POST | `/appointments` | — | Submit an appointment request (status starts `PENDING`) |
| GET | `/appointments/availability?date=YYYY-MM-DD` | — | Open time slots for a date |
| POST | `/contact` | — | Submit a contact message |
| POST | `/admin/auth/login` | — | Admin login, sets httpOnly cookie |
| POST | `/admin/auth/logout` | admin | Clear session |
| GET | `/admin/auth/me` | admin | Current admin profile |
| GET | `/admin/appointments` | admin | List, paginated — `?page&limit&status&date&search` |
| GET | `/admin/appointments/:id` | admin | Get one |
| PATCH | `/admin/appointments/:id` | admin | Update `status` and/or `adminNotes` |
| DELETE | `/admin/appointments/:id` | admin | Delete |
| GET | `/admin/messages` | admin | List contact messages, paginated |
| GET | `/admin/messages/:id` | admin | Get one |
| PATCH | `/admin/messages/:id` | admin | Update `status` (NEW/READ/REPLIED/ARCHIVED) |
| DELETE | `/admin/messages/:id` | admin | Delete |
| GET | `/admin/dashboard` | admin | Appointment/message counts |

All responses use the same envelope:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [{ "path": "email", "message": "..." }] }
```

## 11. Authentication

JWT stored in an `httpOnly` cookie (`admin_token`) set on login — `secure` and `sameSite=none` in production (frontend and backend are on different domains, so the cookie is cross-site as far as the browser is concerned), `sameSite=lax` in development. A `Bearer` token in the `Authorization` header also works, for API testing/tools. Passwords are hashed with bcrypt (12 rounds); hashes are never returned in any response. Login is rate-limited (10 attempts / 15 min per IP) to slow brute-forcing.

## 12. Connecting the frontend

The frontend already points at this API — see [`../src/lib/appointmentApi.ts`](../src/lib/appointmentApi.ts) and [`../src/lib/apiClient.ts`](../src/lib/apiClient.ts). Set the frontend's `VITE_API_URL` (in `../.env.local`, see `../.env.example`) to this server's `/api` base:

```
VITE_API_URL=http://localhost:5000/api
```

In production, set it to the deployed backend's URL, and set this backend's `FRONTEND_URL` to the deployed frontend's exact origin (CORS is origin-locked, never `*`, for authenticated routes).

## 13. Deployment

For the exact Neon/Supabase + Render + Vercel setup this project targets, see [../DEPLOYMENT.md](../DEPLOYMENT.md). Generic version, works on any Node host that gives you a Postgres connection string (Railway, Fly.io, a VPS, etc.):

1. Provision PostgreSQL, set `DATABASE_URL` (and `DIRECT_URL` if it's a pooled/serverless provider — see [DATABASE.md](DATABASE.md)).
2. Set all required env vars (see `.env.example`) — especially `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`.
3. Build: `npm run build` (runs `prisma generate` automatically via `postinstall`).
4. Run migrations against the production database: `npm run prisma:migrate:deploy`.
5. Seed the first admin once: `npm run prisma:seed` (or create one manually — never leave default credentials in place).
6. Start: `npm run start:prod` (runs `prisma migrate deploy` then starts the server — safe to use as the platform's start command so every deploy self-migrates) or plain `npm run start` if you'd rather run migrations as a separate step. The app reads `PORT` from the platform's env.

Docker: `docker-compose.yml` includes both Postgres and the API for a self-contained deployment — `docker compose up -d` builds the image, waits for Postgres, runs migrations, and starts the server.

### Database backup / restore

Not implemented here — this project intentionally does not fake a backup system. Use PostgreSQL's own tooling:

- **Backup:** `pg_dump "$DATABASE_URL" -Fc -f backup.dump` (run on a schedule via your platform's cron/managed backups if it offers one — most managed Postgres providers do this automatically).
- **Restore:** `pg_restore -d "$DATABASE_URL" --clean backup.dump`.
- Test restores periodically — an untested backup is not a backup.

## 14. Manual end-to-end check

Once you have a real Postgres available (Docker or otherwise), verify the full path:

```bash
docker compose up -d db
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Then, with the frontend running (`npm run dev` in the project root) and `VITE_API_URL` pointed at this server:

1. Submit the appointment form from the actual site → confirm it appears in Postgres (`npm run prisma:studio`) with `status = PENDING`.
2. Submit with missing/invalid fields → confirm the frontend shows the server's validation errors.
3. Submit the same date/time twice → confirm the second attempt is rejected (409).
4. `POST /api/admin/auth/login` with the seeded credentials → confirm a cookie is set and `GET /api/admin/auth/me` works.
5. Hit any `/api/admin/*` route without logging in → confirm 401.
6. `PATCH /api/admin/appointments/:id` to change status → confirm it's reflected in Postgres.
7. Check the browser console and this server's logs for errors.

## 15. Project structure

```
backend/
  src/
    config/      env parsing (zod), logger, clinic hours, service list
    lib/          Prisma client singleton
    middleware/    auth, validation, rate limiting, error handling
    validators/    Zod schemas per resource
    services/      business logic (Prisma calls live here)
    controllers/    thin HTTP layer calling services
    routes/         Express routers
    docs/           OpenAPI document (served at /api/docs)
    types/          shared TS types, Express Request augmentation
    utils/          ApiError, response helpers, JWT, password hashing, pagination, dates
    app.ts          Express app assembly (middleware, routes, error handling)
    server.ts       process entrypoint (listen, graceful shutdown)
  prisma/
    schema.prisma  data model
    seed.ts         creates the first admin account
  tests/           Vitest + Supertest, mocked Prisma
```

## 16. What's next

- **Real WhatsApp integration:** not built — the frontend's WhatsApp button stays a plain link (`wa.me`), per the brief. If official WhatsApp Business API integration is wanted later, it should be a new service module here (`services/whatsapp.service.ts`) called the same way `email.service.ts` is — never build unofficial automation against personal WhatsApp.
- **Admin dashboard UI:** this API is ready to support one (`/admin/dashboard`, paginated list endpoints, status updates) — no frontend for it exists yet.
- **Production email:** sends via the [Resend](https://resend.com) HTTPS API (`services/email.service.ts`), which no-ops if `RESEND_API_KEY` is unset. Deliberately not SMTP — Render blocks/restricts outbound SMTP ports, which made an earlier Nodemailer+SMTP transport time out in production.
- **Confirmed clinic hours:** the availability endpoint uses the `CLINIC_*` env vars, currently set to the same placeholder hours as the frontend (see `../CLAUDE.md`) — update them once the clinic confirms real hours.
