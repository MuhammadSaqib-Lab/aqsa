# Aqsa Physiotherapy Centre — Backend API

Production-ready backend for the [Aqsa Physiotherapy Centre frontend](../README.md): patient accounts and appointments, contact messages, review moderation, a Cloudinary-backed photo gallery, an Anthropic-powered FAQ chatbot ("Batkh"), and admin management for all of it. Node.js + TypeScript + Express + PostgreSQL (Prisma) + JWT auth.

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
| `JWT_SECRET` | Long random string signing admin and patient sessions — generate with `openssl rand -hex 32` |
| `FRONTEND_URL` | Exact origin(s) allowed by CORS, comma-separated |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by the seed script to create the first admin account |
| `RESEND_API_KEY` / `EMAIL_FROM` / `CLINIC_NOTIFICATION_EMAIL` | Optional — leave blank to disable email notifications entirely |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Optional — leave blank to disable gallery image uploads (the public gallery list and deletes still work; uploading returns a clean "not configured" error instead of crashing). Get these from a free [Cloudinary](https://cloudinary.com) account dashboard. Required because this server's own filesystem is ephemeral (wiped on every deploy/restart on Render) — images cannot be stored on local disk. |
| `ANTHROPIC_API_KEY` | Optional — leave blank to disable the Batkh chatbot's replies (returns a clean "not configured" message instead of crashing). Get one from [console.anthropic.com](https://console.anthropic.com). |
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

Runs the Vitest suite (`tests/`) against a **mocked Prisma client** — no real database required. Covers: appointment validation and multi-service booking, patient auth (signup/login/session), admin auth (login success/failure, protected-route access, unauthenticated/invalid-token rejection), contact form validation, review submission/moderation, gallery upload/delete (with Cloudinary mocked), the chat endpoint (with the Anthropic SDK mocked — including the "not configured" path when `ANTHROPIC_API_KEY` is unset), and rate limiting.

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
| GET | `/appointments/availability?date=YYYY-MM-DD` | — | Open time slots for a date |
| POST | `/appointments` | patient | Submit an appointment request (status starts `PENDING`) — requires a logged-in patient, no anonymous booking |
| POST | `/contact` | — | Submit a contact message |
| GET | `/reviews?page&limit` | — | Approved reviews only, plus `stats` (average rating, approved count) |
| POST | `/reviews` | patient | Submit a review for a visit (status starts `PENDING`) |
| GET | `/gallery` | — | Current gallery images (no pagination — small dataset by design) |
| POST | `/chat` | — | Body `{ messages: [{role, content}] }` → `{ reply }`. Calls Claude Haiku 4.5, rate-limited |
| POST | `/patient/auth/signup` | — | Create a patient account, sets `patient_token` cookie |
| POST | `/patient/auth/login` | — | Patient login |
| POST | `/patient/auth/logout` | patient | Clear session |
| GET | `/patient/auth/me` | patient | Current patient profile |
| GET | `/patient/appointments` | patient | The logged-in patient's own appointments, paginated |
| GET | `/patient/reviews` | patient | The logged-in patient's own reviews, paginated |
| POST | `/admin/auth/login` | — | Admin login, sets `admin_token` httpOnly cookie |
| POST | `/admin/auth/logout` | admin | Clear session |
| GET | `/admin/auth/me` | admin | Current admin profile |
| GET | `/admin/appointments` | admin | List, paginated — `?page&limit&status&date&search&visitType` |
| GET | `/admin/appointments/:id` | admin | Get one |
| PATCH | `/admin/appointments/:id` | admin | Update `status` and/or `adminNotes` |
| DELETE | `/admin/appointments/:id` | admin | Delete |
| GET | `/admin/messages` | admin | List contact messages, paginated |
| GET | `/admin/messages/:id` | admin | Get one |
| PATCH | `/admin/messages/:id` | admin | Update `status` (NEW/READ/REPLIED/ARCHIVED) |
| DELETE | `/admin/messages/:id` | admin | Delete |
| GET | `/admin/reviews` | admin | List, paginated — `?page&limit&status&search` |
| GET | `/admin/reviews/:id` | admin | Get one |
| PATCH | `/admin/reviews/:id` | admin | Update `status` (PENDING/APPROVED/REJECTED) |
| DELETE | `/admin/reviews/:id` | admin | Delete |
| GET | `/admin/gallery` | admin | List, paginated |
| POST | `/admin/gallery` | admin | Upload an image — multipart `image` file + optional `title`/`caption`. Uploads to Cloudinary, then saves the URL |
| DELETE | `/admin/gallery/:id` | admin | Delete — removes the Cloudinary file too |
| GET | `/admin/dashboard` | admin | Appointment/message/review counts |

Appointments carry `services: string[]` (multi-select; a legacy single `service` column still exists on pre-migration rows), `gender`, and `visitType` (`CLINIC`/`HOME`, with `homeAddress` when `HOME`).

All responses use the same envelope:

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [{ "path": "email", "message": "..." }] }
```

## 11. Authentication

Two independent JWT sessions, both `httpOnly` cookies set on login — `admin_token` for the admin dashboard, `patient_token` for the patient portal — `secure` and `sameSite=none` in production (frontend and backend are on different domains, so the cookie is cross-site as far as the browser is concerned), `sameSite=lax` in development. A `Bearer` token in the `Authorization` header also works for either, for API testing/tools. Passwords are hashed with bcrypt (12 rounds); hashes are never returned in any response. Login is rate-limited (10 attempts / 15 min per IP, both admin and patient) to slow brute-forcing; patient signup is separately rate-limited to deter spam accounts.

## 12. Connecting the frontend

The frontend already points at this API — see [`../src/lib/apiClient.ts`](../src/lib/apiClient.ts) (the shared fetch client) and its callers (`../src/patient/api/patientApi.ts`, `../src/admin/api/adminApi.ts`, `../src/lib/publicApi.ts`, `../src/lib/galleryApi.ts`, `../src/lib/chatApi.ts`). Set the frontend's `VITE_API_URL` (in `../.env.local`, see `../.env.example`) to this server's `/api` base:

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
    config/      env parsing (zod), logger, clinic hours/service list, clinicInfo.ts (chatbot's
                 grounding facts — a deliberate, hand-maintained duplicate of the frontend's clinic.ts)
    lib/          Prisma client singleton
    middleware/    auth (admin), patientAuth (patient), upload (multer, memory storage — never disk,
                 since Render's filesystem is ephemeral), validation, rate limiting, error handling
    validators/    Zod schemas per resource (appointment, contact, review, gallery, chat, patient, auth)
    services/      business logic (Prisma calls live here) — includes imageStorage.service.ts
                 (Cloudinary wrapper) and chatbot.service.ts (Anthropic SDK wrapper), both lazy-init
                 and no-throw-if-unconfigured, same pattern as email.service.ts
    controllers/    thin HTTP layer calling services — admin/ and patient/ subfolders for their routes
    routes/         Express routers — admin/ and patient/ subfolders, plus top-level public routes
                 (appointments, contact, reviews, gallery, chat, health)
    docs/           OpenAPI document (served at /api/docs)
    types/          shared TS types, Express Request augmentation (req.admin / req.patient)
    utils/          ApiError, response helpers, JWT, password hashing, pagination, dates
    app.ts          Express app assembly (middleware, routes, error handling)
    server.ts       process entrypoint (listen, graceful shutdown)
  prisma/
    schema.prisma  data model — AdminUser, Patient, Appointment, ContactMessage, Review, GalleryImage
    seed.ts         creates the first admin account
  tests/           Vitest + Supertest, mocked Prisma (tests/mocks/prisma.mock.ts) — external SDKs
                 (Cloudinary, Anthropic) are also mocked, so the full suite needs no real credentials
```

## 16. What's next

- **Real WhatsApp integration:** not built — the frontend's WhatsApp button stays a plain link (`wa.me`), per the brief. If official WhatsApp Business API integration is wanted later, it should be a new service module here (`services/whatsapp.service.ts`) called the same way `email.service.ts`/`imageStorage.service.ts`/`chatbot.service.ts` are — never build unofficial automation against a personal WhatsApp number.
- **Production email:** sends via the [Resend](https://resend.com) HTTPS API (`services/email.service.ts`), which no-ops if `RESEND_API_KEY` is unset. Deliberately not SMTP — Render blocks/restricts outbound SMTP ports, which made an earlier Nodemailer+SMTP transport time out in production.
- **Gallery image storage:** uploads go straight from a request's memory buffer to Cloudinary (`services/imageStorage.service.ts`) — never to local disk, since Render's filesystem doesn't survive a deploy/restart. No-ops with a clean error if `CLOUDINARY_*` is unset.
- **Batkh chatbot:** `services/chatbot.service.ts` calls Claude Haiku 4.5 via `@anthropic-ai/sdk`, grounded in `config/clinicInfo.ts` (a hand-maintained duplicate of the frontend's clinic facts — the two must be updated together). No conversation history is persisted server-side; the frontend resends the full transcript on each request. No-ops with a clean error if `ANTHROPIC_API_KEY` is unset.
- **Self-service password change:** not exposed yet for either admin or patient accounts — see [../DEPLOYMENT.md](../DEPLOYMENT.md)'s Notes section for the current manual workaround.
- **Confirmed clinic hours:** the availability endpoint uses the `CLINIC_*` env vars, currently set to the same placeholder hours as the frontend (see `../CLAUDE.md`) — update them, `../src/config/clinic.ts`, and `config/clinicInfo.ts` together once the clinic confirms real hours.
