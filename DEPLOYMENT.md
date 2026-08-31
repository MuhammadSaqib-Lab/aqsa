# Deploying Aqsa Physiotherapy Centre

Three pieces, three providers:

```
Vercel (frontend, static/SPA)  →  Render (backend API)  →  Neon/Supabase (PostgreSQL)
```

## Why order matters

Render needs to know the frontend's URL (for CORS / `FRONTEND_URL`). Vercel needs to know the backend's URL (for `VITE_API_URL`). Neither exists until the other is deployed once. The order below breaks that circularity: deploy the database, then the backend (with a placeholder `FRONTEND_URL`), then the frontend (now you have a real backend URL to point it at), then go back and fix `FRONTEND_URL` on Render with the real Vercel URL.

---

## Step 1 — PostgreSQL (Neon, recommended)

1. Create a free project at [neon.tech](https://neon.tech).
2. In the Neon dashboard, copy **two** connection strings from the "Connection Details" panel:
   - **Pooled** connection (the default one shown, has `-pooler` in the hostname) → this becomes `DATABASE_URL`
   - **Direct** connection (toggle "Pooled connection" off, or use the non-pooler hostname) → this becomes `DIRECT_URL`

   Both need `?sslmode=require` appended if Neon doesn't already include it.

   This split matters: Prisma migrations must run against a direct connection — running them through a transaction-mode pooler (PgBouncer) can fail or misbehave. The schema (`backend/prisma/schema.prisma`) already has `directUrl` wired up for exactly this.

<details>
<summary>Using Supabase instead</summary>

Same idea, different UI: Project Settings → Database → Connection string.
- **Pooled** (port `6543`, add `?pgbouncer=true`) → `DATABASE_URL`
- **Direct** (port `5432`) → `DIRECT_URL`

Supabase free projects pause after a week of inactivity — you'll need to manually un-pause from the dashboard if that happens (Neon's free tier auto-resumes on the next request instead, no manual step needed).
</details>

3. **Run the first migration against this new database, from your local machine**, before deploying the backend:

   ```bash
   cd backend
   # Temporarily point these at the cloud DB (don't commit this — it's just for this one command)
   DATABASE_URL="<neon pooled url>" DIRECT_URL="<neon direct url>" npx prisma migrate deploy
   ```

   (On Windows PowerShell: `$env:DATABASE_URL="..."; $env:DIRECT_URL="..."; npx prisma migrate deploy`)

4. Seed the first admin account the same way:

   ```bash
   DATABASE_URL="<neon pooled url>" DIRECT_URL="<neon direct url>" ADMIN_EMAIL="you@realaddress.com" ADMIN_PASSWORD="a-strong-password" npx tsx prisma/seed.ts
   ```

   Use a real admin email and a strong password here — this is the production account, not the local dev placeholder.

---

## Step 2 — Backend on Render

1. [render.com](https://render.com) → **New** → **Web Service** → connect the `MuhammadSaqib-Lab/aqsa` GitHub repo.
2. Configure:
   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Environment | Node |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm run start:prod` |
   | Health Check Path | `/api/health` (see note below — not `/ready`) |
   | Instance Type | Free is fine to start |

   `npm run start:prod` runs `prisma migrate deploy` before starting the server, so every deploy automatically applies any new migrations. `postinstall` (already in `package.json`) runs `prisma generate` automatically after `npm install`.

   **Root Directory is the setting people miss.** If it's left blank/`.`, Render builds and runs from the repo root — where there's a *frontend* `package.json` whose build never produces `dist/server.js` — and you'll see `Error: Cannot find module '/opt/render/project/src/dist/server.js'` (note: no `/backend/` in that path — that's the tell). If you'd rather this live in the repo instead of only in the dashboard, `render.yaml` at the repo root declares the same config as a Blueprint — use **New → Blueprint** instead of **New → Web Service** to pick it up automatically (a service already created manually via "Web Service" won't retroactively read it; fix Root Directory by hand for that one, or delete and recreate as a Blueprint).

3. Environment variables (Render dashboard → Environment):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon/Supabase **pooled** connection string |
   | `DIRECT_URL` | Neon/Supabase **direct** connection string |
   | `NODE_ENV` | `production` |
   | `PORT` | leave unset — Render injects this itself, the app already reads `process.env.PORT` |
   | `FRONTEND_URL` | `https://placeholder.vercel.app` for now — you'll fix this in Step 4 |
   | `JWT_SECRET` | a **new** long random value — `openssl rand -hex 32` — do **not** reuse the local dev one |
   | `JWT_EXPIRES_IN` | `1d` |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | not needed here — you already seeded manually in Step 1; only needed if you re-run the seed |
   | `CLINIC_TIMEZONE`, `CLINIC_OPEN_TIME`, `CLINIC_CLOSE_TIME`, `CLINIC_SLOT_MINUTES`, `CLINIC_WORKING_DAYS` | copy from `backend/.env.example`, adjust once real hours are confirmed |
   | `SMTP_*`, `EMAIL_FROM`, `CLINIC_NOTIFICATION_EMAIL` | optional — leave blank to keep email notifications disabled |
   | `ENABLE_API_DOCS` | leave `false`/unset unless you want Swagger UI reachable in production |

4. Deploy. Once live, note the URL Render gives you, e.g. `https://aqsa-physio-api.onrender.com`.

**Why `/api/health` and not `/api/health/ready` for the health check:** Neon's free tier suspends its compute after inactivity and takes a moment to wake on the next query. If Render's health check hits `/ready` (which queries the database) during that cold-start window, it can look "unhealthy" and trigger an unnecessary restart. `/api/health` is a pure liveness check with no DB call, so it doesn't have that failure mode. `/api/health/ready` still exists for you to check DB connectivity manually any time.

---

## Step 3 — Frontend on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import the same GitHub repo.
2. Root Directory: leave as `.` (the repo root) — the frontend lives there, `backend/` is just a sibling folder Vercel ignores. Framework Preset should auto-detect **Vite**.
3. Environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://aqsa-physio-api.onrender.com/api` (your real Render URL from Step 2, **with** the `/api` suffix) |
4. Deploy. `vercel.json` (already in the repo) rewrites every path to `index.html`, so client-side routes like `/admin/appointments` work correctly on a hard refresh instead of 404ing.
5. Note the URL Vercel gives you, e.g. `https://aqsa-physio.vercel.app`.

---

## Step 4 — Close the loop

Go back to Render → your backend service → Environment → set `FRONTEND_URL` to the real Vercel URL from Step 3 (exact origin, no trailing slash — e.g. `https://aqsa-physio.vercel.app`). Save, which triggers a redeploy.

If you later add a custom domain to either side, add it too — `FRONTEND_URL` accepts a comma-separated list (`https://aqsa-physio.vercel.app,https://www.aqsaphysio.com`).

---

## Step 5 — Verify in production

1. Open the Vercel URL, submit the appointment form for real → check it appears in Neon/Supabase (their web SQL editor, or `npx prisma studio` locally with `DATABASE_URL`/`DIRECT_URL` pointed at the cloud DB).
2. `https://your-backend.onrender.com/api/health` → should return `{"success":true,...}`.
3. Log into `/admin` on the Vercel URL with the real admin credentials from Step 1.4 → confirm the dashboard loads real data. This specifically exercises the cross-site cookie fix (`SameSite=None; Secure`) — if login succeeds but `/admin` immediately bounces you back to the login page, that's the symptom of `FRONTEND_URL`/cookie config being wrong; double check Step 4.
4. Hard-refresh `/admin/appointments` directly (not by clicking a link) → confirms the Vercel rewrite is working.

---

## Notes

- **Render free tier** spins the service down after 15 minutes of no traffic; the first request after that takes a few extra seconds to wake it up. Fine for a low-traffic clinic site; upgrade the instance type if that cold start becomes a problem.
- **Rotating secrets:** if `JWT_SECRET` ever changes, every existing admin session is invalidated (everyone has to log in again) — that's expected, not a bug.
- **Changing the admin password:** log in, then use `PATCH` isn't exposed for self-service password change yet — for now, update it by re-running the seed's hashing logic manually or editing `passwordHash` via `prisma studio` pointed at the cloud DB. (A self-service "change password" endpoint would be a reasonable next feature if this is needed often.)
- **Custom domains:** point them at Vercel/Render as usual, then update `FRONTEND_URL` (Render) and `VITE_API_URL` (Vercel) to match — both are just environment variables, no code changes needed.
