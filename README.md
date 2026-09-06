# Aqsa Physiotherapy Centre — Website

A modern, responsive marketing website and patient portal for Aqsa Physiotherapy Centre, a physiotherapy and rehabilitation clinic in Haripur, Khyber Pakhtunkhwa, Pakistan, with a companion backend API for appointments, patient accounts, reviews, a dynamic photo gallery, and an AI FAQ chatbot.

This repo has two independent projects:

- **This directory** — the frontend (React + Vite).
- **[`backend/`](backend/)** — the API (Node + Express + PostgreSQL/Prisma). See [backend/README.md](backend/README.md) to run it.

The frontend talks to the backend exclusively over HTTP at `VITE_API_URL` (see `.env.example`) — nothing is shared/imported between the two projects.

For production deployment (Vercel + Render + Neon), see [DEPLOYMENT.md](DEPLOYMENT.md). For the full architecture, folder structure, and future-development notes, see [CLAUDE.md](CLAUDE.md).

## Features

- Sticky, scroll-aware navigation with mobile drawer menu and active-section highlighting
- Hero section with trust indicators and clinic imagery
- About, Services, Conditions, Equipment, Why Choose Us, Treatment Process, Testimonials, and FAQ sections
- **Patient portal** (`/patient`) — signup/login, book appointments (multi-service selection, clinic or home visit, gender preference), view your own appointment history, and rate a completed visit
- **Dynamic photo gallery** (`/gallery`) — fetches live from the backend; admins upload/delete photos (with title/caption) from the admin dashboard, stored on Cloudinary
- **"Batkh🦆" AI chatbot** — a floating FAQ widget (Claude Haiku 4.5) that answers questions about hours, services, and appointment policy, grounded only in the clinic's real published facts
- **Public reviews** — real, admin-moderated patient reviews with an average rating, shown on the site (separate from the placeholder testimonials, which are marked as such)
- Contact section with phone/WhatsApp/email/address, hours, and a map embed
- Scroll progress bar, back-to-top button, floating WhatsApp button (with a clear caption), mobile bottom appointment bar
- Custom 404 page
- Admin dashboard (`/admin`) — secure login, live stats, and full management (search/filter/pagination) of appointments, contact messages, review moderation, and the gallery
- Scroll-reveal animations that respect `prefers-reduced-motion`
- Fully responsive (mobile, tablet, laptop, desktop)

## Tech stack

**Frontend:**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev/build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) (theme tokens in `src/index.css`)
- [React Router](https://reactrouter.com/) for routing
- [lucide-react](https://lucide.dev/) for icons

**Backend & infrastructure** (see [backend/README.md](backend/README.md) for details):
- Node.js + Express + TypeScript, [Prisma](https://www.prisma.io/) ORM
- [PostgreSQL](https://www.postgresql.org/) — hosted on [Neon](https://neon.tech) in production
- [Cloudinary](https://cloudinary.com) — persistent image storage for the gallery (the backend host's own disk is ephemeral)
- [Anthropic Claude API](https://www.anthropic.com/api) (`@anthropic-ai/sdk`, model `claude-haiku-4-5`) — powers the Batkh chatbot
- [Resend](https://resend.com) — transactional email (appointment/contact notifications)
- Deployed on [Vercel](https://vercel.com) (frontend) + [Render](https://render.com) (backend)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

By default the app talks to `http://localhost:5000/api`. To point it elsewhere, copy `.env.example` to `.env.local` and set `VITE_API_URL`. Without a backend running, the site's forms and the gallery/chat widget will show network-error states when used — see [backend/README.md](backend/README.md) to run the full API (Postgres + Prisma) alongside this.

### Other commands

```bash
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint       # run ESLint
```

## Environment variables

**Frontend** (this directory) — copy `.env.example` to `.env.local`:

| Variable | Required? | Purpose |
|---|---|---|
| `VITE_API_URL` | No | Backend API base URL, e.g. `http://localhost:5000/api` locally or `https://your-backend.onrender.com/api` in production. Falls back to a hardcoded production Render URL if unset, so the deployed frontend still works without it. |

**Backend** (`backend/`) — copy `backend/.env.example` to `backend/.env`. Full list with comments in that file; summary here, details in [backend/README.md](backend/README.md#4-environment-variables):

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Yes | PostgreSQL connection strings (pooled / direct — see [backend/DATABASE.md](backend/DATABASE.md)) |
| `JWT_SECRET` | Yes | Signs both admin and patient session cookies |
| `FRONTEND_URL` | Yes | Exact allowed origin(s) for CORS, comma-separated |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Once | Used only by the seed script to create the first admin account |
| `RESEND_API_KEY` / `EMAIL_FROM` / `CLINIC_NOTIFICATION_EMAIL` | No | Email notifications — disabled (not broken) if left blank |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No | Gallery image uploads — disabled (clean error, not a crash) if left blank |
| `ANTHROPIC_API_KEY` | No | Powers the Batkh chatbot's replies — returns a clean "not configured" message if left blank |
| `CLINIC_*` | No | Clinic hours/timezone used by the availability endpoint — placeholders, see [CLAUDE.md](CLAUDE.md) |

Every optional variable above degrades gracefully when unset — the app never crashes for a missing third-party key, it just disables that one feature until the key is added.

## Project structure

```
src/
  config/clinic.ts        # All clinic content — name, contact info, hours, services,
                           # conditions, features, process steps, FAQs, team, testimonials
  pages/                  # Home and 404 pages
  components/
    layout/               # Navbar, mobile menu, footer, scroll progress, back-to-top, WhatsApp button
    chat/                 # ChatWidget.tsx — the floating "Batkh🦆" FAQ chatbot
    sections/              # One component per homepage section, plus Gallery.tsx (its own /gallery route)
    cards/                 # Reusable card components (service, condition, feature, team, etc.)
    forms/                 # Appointment form (requires a logged-in patient) and FAQ accordion
    ui/                    # Button, Modal, SectionHeading, scroll-reveal wrapper
  admin/                  # Admin dashboard — appointments, messages, review moderation, gallery management
  patient/                # Patient portal — signup/login, book/track appointments, rate a visit
  context/                # Toast notifications and appointment modal state
  hooks/                  # Scroll spy, scroll progress, reduced motion, intersection observer, etc.
  lib/
    apiClient.ts           # Centralized fetch client (base URL, JSON or FormData bodies, timeout, error handling)
    galleryApi.ts          # Public gallery fetch — GET /api/gallery
    chatApi.ts             # Batkh chatbot — POST /api/chat
    publicApi.ts           # Public reviews — GET /api/reviews
public/
  images/                 # Logo, team photos, and clinic photos used on the site
backend/                  # Separate Node/Express/PostgreSQL API — see backend/README.md
```

See [CLAUDE.md](CLAUDE.md) for a full file-by-file breakdown, the current clinic data reference, and notes for future development.

## Editing content

All site copy lives in one file: [src/config/clinic.ts](src/config/clinic.ts). Update contact details, services, conditions, testimonials, FAQs, or team bios there — no component changes needed.

To restyle the site, edit the CSS variables (`--color-primary`, `--color-accent`, etc.) in [src/index.css](src/index.css).

## Before launch

A few placeholders still need real information before this goes live:

- **Testimonials** — the `clinic.ts` testimonials array is still placeholder copy; real, moderated patient reviews are now shown separately via the Reviews system (patients submit from the portal, admins approve in `/admin/reviews`)
- **Opening hours** — unconfirmed, verify with the clinic
- **Map embed** — currently a text-query embed, not a verified pin
- **Facebook/Instagram links** — currently `#`; the clinic's Facebook page name is known ("Aqsa Physio Therpy") but not its URL

## Backend

The frontend talks to the API in [`backend/`](backend/) for everything dynamic — patient accounts and appointments, contact messages, reviews, the gallery, and the chatbot. See [backend/README.md](backend/README.md) for setup, the full environment variable list, database migrations, and the complete API reference (public, patient, and admin endpoints).
