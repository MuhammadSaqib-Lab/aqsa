# Aqsa Physiotherapy Centre — Website

Marketing site + patient portal for Aqsa Physiotherapy Centre (Haripur, KPK, Pakistan), with a
companion backend API. No payment system.

**Two independent projects in this repo:**
- Project root (`src/`, this file) — the frontend, documented below.
- [`backend/`](backend/) — separate Node/Express/PostgreSQL/Prisma API with its own
  `package.json`, own `CLAUDE.md`-equivalent in [`backend/README.md`](backend/README.md).
  The frontend only talks to it over HTTP via `VITE_API_URL`; nothing is shared/imported
  between the two — see "Backend integration" below for the one deliberate exception
  (duplicated clinic facts for the chatbot).

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`; theme tokens live in `src/index.css` under `:root` / `@theme inline`, not a `tailwind.config.js`)
- React Router — public site at `/` and `/gallery` (in-page sections are anchor-linked on both), patient portal under `/patient/*`, admin dashboard under `/admin/*`, `*` renders `NotFound`
- lucide-react for icons
- Deployed on **Vercel** (frontend) + **Render** (backend) + **Neon** (Postgres) — see [DEPLOYMENT.md](DEPLOYMENT.md). Backend integrations: **Cloudinary** (gallery image storage) and **Anthropic's Claude API** (the "Batkh" chatbot) — both optional/degrade-gracefully, see [backend/README.md](backend/README.md).

## Commands

```bash
npm install
npm run dev       # start dev server (Vite, default port 5173)
npm run build     # tsc -b && vite build
npm run lint       # eslint .
npm run preview   # preview the production build
```

Last verified: `npm run build` compiles clean (no TS errors); `npm run lint` returns 0 errors (4 benign `react-refresh/only-export-components` warnings on `AppointmentContext.tsx`, `ToastContext.tsx`, `AdminAuthContext.tsx`, and `PatientAuthContext.tsx` — expected for files exporting both a provider component and a hook).

## Patient portal (`src/patient/`)

Booking an appointment now requires a patient account — there is no anonymous/guest booking path. `POST /api/appointments` on the backend is gated behind `authenticatePatient`, so `AppointmentForm.tsx` (still the shared form component, used both standalone and inside `NewAppointmentPage.tsx`) calls `patient/api/patientApi.ts`, not a public endpoint.

- `patient/context/PatientAuthContext.tsx` — session state (`patient_token` httpOnly cookie, separate from the admin's `admin_token`), `login()`/`signup()`/`logout()`.
- `patient/components/` — `PatientLayout` (portal shell/nav), `ProtectedPatientRoute` (redirects to `/patient/login` when unauthenticated), `RateVisitModal` (patients rate a completed visit — `POST /api/reviews`, authenticated as a patient; moderated by an admin before it appears publicly).
- `patient/pages/` — `PatientLoginPage`, `PatientSignupPage`, `PatientDashboardPage` (lists the patient's own appointments and reviews via `GET /api/patient/appointments` and `GET /api/patient/reviews`), `NewAppointmentPage` (hosts `AppointmentForm`).
- `patient/types.ts` — `PatientAppointment`/`PatientAppointmentFormValues` are **deliberately their own interfaces**, not reused from the admin `AdminAppointment` shape, so the patient-facing type can never accidentally gain an admin-only field (e.g. `adminNotes`) just because someone extends the admin one later.
- Appointments carry `services: string[]` (multi-select — a legacy single `service: string | null` still exists on old rows, always fall back to it when `services` is empty), `gender` (required at booking), and `visitType: "CLINIC" | "HOME"` (+ `homeAddress` when `HOME`).

## Admin dashboard (`src/admin/`)

Separate route tree, same app — `/admin/login` and `/admin/*` (dashboard home, appointments, messages, reviews, gallery), added as sibling `<Route>`s in `App.tsx` alongside the public routes (no public-site chrome — Navbar/Footer/etc. — renders there). Auth is a session cookie set by the backend (`GET /api/admin/auth/me` on load decides authenticated/unauthenticated; unauthenticated users are redirected to `/admin/login`).

- `admin/api/adminApi.ts` — thin wrapper over the same `lib/apiClient.ts` used by the public site; no duplicate fetch logic. Gallery's `uploadGalleryImage()` passes a `FormData` body — `apiClient.ts` detects `FormData` and skips `JSON.stringify`/the `Content-Type` header so the browser can set the multipart boundary itself.
- `admin/context/AdminAuthContext.tsx` — session state (`loading`/`authenticated`/`unauthenticated`), `login()`/`logout()`.
- `admin/components/` — `AdminLayout` (sidebar + topbar shell, responsive mobile drawer — `navItems` array is the source of truth for sidebar tabs), `ProtectedAdminRoute`, `AppointmentDetailModal` / `MessageDetailModal` / `ReviewDetailModal` (status actions, delete via `ConfirmDialog`), `ReviewStatusBadge`, `Pagination`, `ConfirmDialog`, `EmptyState`/`LoadingBlock`/`ErrorBlock`.
- `admin/pages/` — `AdminLoginPage`, `DashboardHomePage` (live counts from `GET /api/admin/dashboard`), `AppointmentsPage`, `MessagesPage`, `ReviewsPage` (moderate patient-submitted reviews — pending/approved/rejected), `GalleryPage` (upload form with title/caption + a delete button per image, backed by Cloudinary — see "Gallery" below).
- All data is real — every number/row comes from PostgreSQL through the `backend/` admin API. No mock/fake dashboard data.
- `components/ui/Modal.tsx` has an optional `maxWidthClassName` prop (default `max-w-lg`) so admin detail modals can be wider — backward compatible with the appointment-booking modal.

## Gallery (`/gallery` page + admin management)

`/gallery` is its own route (not a Home-page anchor section), sharing the same public-site chrome as `/` (`ScrollProgressBar`, `Navbar`, `Footer`, `WhatsAppButton`, `ChatWidget`, `BackToTopButton`, `MobileAppointmentBar`).

- Images are **fully dynamic** — `src/components/sections/Gallery.tsx` fetches `GET /api/gallery` via `src/lib/galleryApi.ts` (loading/empty/error states inline). There is no static fallback array any more; `config/clinic.ts`'s old `gallery` export was removed when this shipped.
- Admins manage images from `/admin/gallery` (`GalleryPage.tsx`): upload (image file + optional title/caption, multipart via `FormData`) and delete, backed by `GET/POST /api/admin/gallery` and `DELETE /api/admin/gallery/:id`.
- Real storage is **Cloudinary**, not the backend's own disk — Render's filesystem is ephemeral (wiped on every deploy/restart), so images are uploaded straight from a memory buffer to Cloudinary; the database only stores the resulting URL + Cloudinary `publicId` (needed to delete the remote file later). If `CLOUDINARY_*` env vars are unset, uploads fail with a clean "not configured" error instead of crashing — see [backend/README.md](backend/README.md).
- The four original static photos (`public/images/clinic-*.jpg`, `gallery-*.jpg`) are **not** auto-migrated into the database — an admin re-uploads any of them they want kept, now with a real caption. `gallery-treatment-room.jpg` and `gallery-diagnostic-equipment.jpg` are currently unreferenced by any component (kept as source material only); `clinic-manual-therapy.jpg`/`clinic-band-exercise.jpg` are still used by `Hero.tsx`/`About.tsx`.

## "Batkh🦆" chatbot (`src/components/chat/ChatWidget.tsx`)

A floating FAQ widget, mounted on the `/` and `/gallery` route chrome only (same pattern as `WhatsAppButton` — not shown on `/admin/*` or `/patient/*`).

- Launcher is a plain duck-emoji circular button with a small speech-bubble-shaped "Batkh Chats" caption above it (an actual CSS speech bubble with a tail, not the 💭 glyph) and enough vertical clearance to not collide with `WhatsAppButton` below it. `WhatsAppButton.tsx` similarly has a small "WhatsApp" caption underneath it in the same italic `font-display` (Fraunces) style, for consistent labeling between the two floating buttons.
- Conversation history is kept in local React state only (no backend persistence) and sent in full with every request — this is a stateless, single-turn-per-call design appropriate for a small FAQ bot, not a real multi-session chat backend.
- `src/lib/chatApi.ts` posts `{ messages }` to `POST /api/chat`. The backend (`backend/src/services/chatbot.service.ts`) calls Claude Haiku 4.5 via the official `@anthropic-ai/sdk`, with a system prompt built from `backend/src/config/clinicInfo.ts` — a **deliberately duplicated**, backend-only subset of `src/config/clinic.ts`'s facts (hours, services, FAQs, appointment policy). This is the one place this project intentionally breaks the "frontend and backend share nothing" rule, because the backend cannot import frontend source; keep the two files in sync if clinic facts change.
- The bot is instructed to never fabricate hours/pricing/availability, to decline medical-diagnosis questions and redirect to booking/calling instead, and to say plainly when it doesn't know something. If `ANTHROPIC_API_KEY` is unset, the endpoint returns a clean "chat assistant is not configured yet" error rather than crashing.

## Full project structure

```
src/
  main.tsx                          # ReactDOM root, wraps App in BrowserRouter
  App.tsx                           # Router + ToastProvider + AppointmentProvider, route table
                                     # (public "/" and "/gallery", "/admin/*", "/patient/*")
  index.css                         # Tailwind v4 import, :root theme tokens, @theme inline mapping, global styles/animations
  vite-env.d.ts

  pages/
    Home.tsx                        # Assembles all sections in order for the `/` route
    NotFound.tsx                    # Custom 404 page

  config/
    clinic.ts                       # SINGLE SOURCE OF TRUTH for all site copy/data (see below) —
                                     # no longer includes a `gallery` array; that's fully dynamic now

  types/
    index.ts                       # Shared TS interfaces: NavLink, Service, Condition, Feature,
                                     # ProcessStepData, Testimonial, FAQItem, TeamMember, GalleryImage,
                                     # PublicReview, ReviewStats, and the Appointment*/Review*/Gender/
                                     # VisitType enums shared with admin/patient types

  context/
    ToastContext.tsx                # Toast notification provider + useToast() hook
    AppointmentContext.tsx          # Appointment modal open/close state + useAppointment() hook

  hooks/
    useLockBodyScroll.ts            # Locks <body> scroll while a modal/drawer is open
    useOnScreen.ts                  # IntersectionObserver hook, powers scroll-reveal animations
    useReducedMotion.ts             # Reads prefers-reduced-motion, used to gate animations
    useScrollProgress.ts            # Powers the top ScrollProgressBar
    useScrollSpy.ts                 # Tracks which section is in view, powers Navbar active-link state
    useDebouncedValue.ts            # Debounces admin/search inputs before hitting the API

  lib/
    apiClient.ts                    # Centralized fetch client for backend/ — base URL (VITE_API_URL,
                                     # hardcoded production fallback), JSON *or* FormData bodies,
                                     # timeout/abort, error normalization (ApiRequestError), console logging
    publicApi.ts                    # listPublicReviews() — GET /api/reviews
    galleryApi.ts                   # fetchGalleryImages() — GET /api/gallery
    chatApi.ts                      # sendChatMessage() — POST /api/chat
    navHref.ts                      # resolveNavHref() — prefixes "#anchor" hrefs with "/" so shared
                                     # chrome (Navbar/MobileMenu/Footer) resolves them correctly from
                                     # non-home routes like /gallery

  components/
    layout/
      Navbar.tsx                    # Sticky header, scroll-aware style change, active-section highlighting, CTA button
      MobileMenu.tsx                # Slide-in mobile nav drawer (triggered from Navbar hamburger)
      Footer.tsx                    # Logo/description, quick links, services list, contact, social placeholders, copyright
      ScrollProgressBar.tsx         # Thin fixed progress bar tied to scroll position
      BackToTopButton.tsx           # Fixed button, appears after scrolling, smooth-scrolls to top
      WhatsAppButton.tsx            # Fixed floating WhatsApp CTA + small "WhatsApp" caption underneath
      MobileAppointmentBar.tsx      # Fixed bottom "Book an Appointment" bar, mobile only

    chat/
      ChatWidget.tsx                # Floating "Batkh🦆" FAQ chat widget — see above

    sections/                       # One file per Home.tsx section, in page order
      Hero.tsx                      # Headline, subcopy, CTA buttons, trust indicators, floating cards, clinic image
      About.tsx                     # Centre intro, mission, patient-centered approach, non-numeric stat highlights
      Services.tsx                  # Grid of ServiceCard from `services` config
      Conditions.tsx                # Pill/card grid of ConditionCard from `conditions` config + assessment disclaimer
      Equipment.tsx                 # Educational grid of commonly-used equipment (not an inventory claim)
      FemalePhysiotherapy.tsx        # Policy-only section: female physiotherapist requestable, subject to availability
      WhyChooseUs.tsx                # Grid of FeatureCard from `features` config
      Process.tsx                   # 4-step ProcessStep timeline from `processSteps` config
      Testimonials.tsx              # Carousel/grid of TestimonialCard from `testimonials` config (placeholder data)
      FAQSection.tsx                 # FAQAccordion wrapper using `faqs` config
      AppointmentCTA.tsx            # Conversion banner section, opens the appointment modal
      Contact.tsx                   # ContactCard(s) for phone/WhatsApp/email/address/hours + map embed
      Gallery.tsx                   # Own route (/gallery), not a Home.tsx section — fetches GET /api/gallery

    cards/
      ServiceCard.tsx
      ConditionCard.tsx
      FeatureCard.tsx
      ProcessStep.tsx
      TestimonialCard.tsx
      TeamCard.tsx
      ContactCard.tsx

    forms/
      AppointmentForm.tsx           # Full client-side validation, loading/success/error states, accessible
                                     # markup. Requires a logged-in patient — submits via
                                     # patient/api/patientApi.ts, not a public endpoint.
      FAQAccordion.tsx

    ui/
      Button.tsx                    # Shared button component (variants used across CTAs)
      Modal.tsx                     # Accessible dialog primitive, Escape-to-close, focus handling, backdrop,
                                     # optional maxWidthClassName
      Reveal.tsx                    # Wraps children with the useOnScreen scroll-reveal fade/slide-up animation
      SectionHeading.tsx            # Shared eyebrow/title/subtitle heading used at the top of every section

  admin/                            # See "Admin dashboard" above
  patient/                          # See "Patient portal" above

public/
  robots.txt
  images/
    logo.png                        # Clinic logo (used in Navbar/Footer)
    doctor-amjad-awan.jpg            # Cropped/optimized team portrait
    doctor-sahil.jpg                 # Cropped/optimized team portrait
    clinic-manual-therapy.jpg        # Clinic/treatment photo (used in Hero/About)
    clinic-band-exercise.jpg         # Clinic/treatment photo (used in Hero/About)
    gallery-treatment-room.jpg       # No longer referenced by any component (source material only)
    gallery-diagnostic-equipment.jpg # No longer referenced by any component (source material only)
    og-cover.jpg                     # Open Graph social preview image
```

Project root also still contains the **original, unprocessed marketing assets** the images above were cropped/optimized from (Facebook-exported photos, a clinic video, and raw doctor photos: `102563896_...jpg`, `483369169_...jpg`, `483509717_...jpg`, `484092721_...jpg`, `484110461_...jpg`, `484650548_...jpg`, `514520329_...jpg`, `515372070_...jpg`, `656957279_...jpg`, one `.mp4`, `Dr Muhammad Amjad awan.jfif`/`.jpg`, `Dr sahil pt.jpg`). These are source material, not referenced by the site — pull from them if more/replacement images are needed in `public/images/`, or upload them straight through `/admin/gallery` now that the gallery is dynamic.

## Clinic data (`src/config/clinic.ts`) — current values

This is the single source of truth for every piece of copy on the public site (the backend keeps its own small duplicate for the chatbot — see `backend/src/config/clinicInfo.ts` above). Editing this file updates the whole site without touching components.

- **Name / tagline:** Aqsa Physiotherapy Centre — "Move Better. Feel Stronger. Live Without Limits."
- **Location:** Haripur, Khyber Pakhtunkhwa, Pakistan — address: "Tarbela Road, near District Council, Haripur, KPK, Pakistan"
- **Phone:** 0314-2247280 (primary / WhatsApp), 0345-5131814 (secondary)
- **Email:** Muhammadamjad2812@gmail.com
- **Hours (placeholder, unconfirmed):** Mon–Sat 9:00 AM–8:00 PM, Sunday by appointment
- **Map:** text-query Google Maps embed for "Tarbela Road, Haripur, Pakistan" (not a verified pin)
- **Social:** Facebook/Instagram both `#` placeholders (real Facebook page name known: "Aqsa Physio Therpy", URL not known)
- **Services (9):** Pain Management, Sports Injury Rehabilitation, Back & Neck Pain, Post-Surgical Rehabilitation, Joint Rehabilitation, Exercise Therapy, Posture & Mobility, Neurological Rehabilitation, Home Physiotherapy — each with icon, description, and detail bullets
- **Conditions (12):** Back Pain, Neck Pain, Shoulder Pain, Knee Pain, Sports Injuries, Joint Stiffness & Arthritis, Muscle Strain, Post-Surgical Recovery, Mobility Problems, Posture-Related Issues, Stroke Recovery, Paediatric Conditions
- **Equipment (6):** general/educational descriptions only (TENS, ultrasound, hot/cold therapy, resistance bands, parallel bars, traction) — never asserted as this clinic's specific inventory
- **Female physiotherapist policy (4 points):** requestable at booking, subject to availability — never names a specific physiotherapist or guarantees one
- **Features / Why Choose Us (6):** Personalized Treatment, Patient-Centered Care, Professional Approach, Functional Recovery, Supportive Environment, Ongoing Guidance
- **Process (4 steps):** 01 Initial Assessment → 02 Personalized Plan → 03 Guided Treatment → 04 Progress & Recovery
- **Testimonials (5, explicitly placeholder):** Imran S. (Back Pain), Ayesha K. (Post-Surgical Rehabilitation), Bilal R. (Sports Injury), Sana M. (Neck & Shoulder Pain), Waqas A. (Joint Rehabilitation) — real, moderated patient reviews are now also shown live via `GET /api/reviews` (see Reviews below); these two data sources are independent, don't conflate them
- **FAQs (7):** first-visit expectations, session length, whether an appointment is needed, what to wear, how many sessions, whether physio helps back pain, continuing normal activities — all worded to avoid medical promises
- **Team (2):**
  - **Dr. Muhammad Amjad Awan** — Founder & Physiotherapist. Credentials: DPT (Pakistan), DHPMS (Pakistan), OT (Florence, Italy), BLS (Pakistan), MA, MSc (Pakistan), Ex-Physiotherapist Pakistan Navy. Bio references PNS Shifa Naval Hospital (Karachi) and PNS Hafeez Naval Hospital (Islamabad).
  - **Dr. Sahil** — Physiotherapist, supports patients through guided exercise therapy and hands-on rehabilitation.

All of the above (except testimonials, hours, map pin, and social URLs) is transcribed from the clinic's own printed marketing material — not invented.

## Reviews (public display + patient submission + admin moderation)

- Patients rate a visit from the patient portal (`RateVisitModal.tsx` → `POST /api/reviews`, patient-authenticated) — every review starts `PENDING`.
- Admins moderate from `/admin/reviews` (approve/reject/delete).
- Only `APPROVED` reviews are ever shown publicly, via `GET /api/reviews` (`src/lib/publicApi.ts`) — average rating + approved count are computed server-side and returned alongside the list.

## Content rules (carried over from the original brief)

- No fabricated patient counts, awards, doctor credentials, or years of experience. Only the qualifications transcribed from the clinic's own printed material (in `clinic.ts`) are presented as fact.
- Placeholder `testimonials` in `clinic.ts` are explicitly labeled as such — real, consented reviews now flow through the Reviews system above instead of ever editing this array to look real.
- Opening hours are a placeholder pending confirmation from the clinic — verify before launch. The same placeholder value is duplicated in the backend's `clinicInfo.ts` for the chatbot; update both together.
- The Google Maps embed uses a text-query embed (`clinic.mapEmbedSrc`), not a verified pin — replace with the exact location once confirmed.
- Facebook/Instagram links in `clinic.social` are placeholders (`#`) — the clinic's real Facebook page name is known ("Aqsa Physio Therpy") but not its URL.
- The chatbot must never state a fact that isn't in `backend/src/config/clinicInfo.ts` — if you add a fact to the public site's `clinic.ts` that the bot should also know, add it there too.

## Backend integration

The frontend talks to the backend over HTTP only — base URL from `VITE_API_URL` (`src/lib/apiClient.ts`, with a hardcoded production Render URL as a fallback so the deployed frontend still works if the env var is ever unset on Vercel). See [backend/README.md](backend/README.md) to run it (PostgreSQL + Prisma, `npm run dev` inside `backend/`) and for the full API reference, environment variables, and the Cloudinary/Anthropic setup needed for the gallery and chatbot to fully work.

The backend independently re-validates everything the frontend already validates — never assume the frontend's checks are sufficient on their own.

## Verification history

- Build/lint verified clean as of 2026-09-07, after adding Gallery Management (admin CRUD + Cloudinary) and the Batkh chatbot (Anthropic Claude Haiku 4.5).
- Manually verified in-browser: hero renders; `/gallery` fetches and renders live images (loading/empty/error states); admin Gallery tab uploads (fails cleanly without real Cloudinary keys, succeeds with them) and deletes; Batkh chat widget opens/closes, sends messages, and fails cleanly without a real `ANTHROPIC_API_KEY`; WhatsApp and Batkh floating buttons render distinctly with clear spacing and no icon overlap, at both desktop and 375px mobile widths.

## Future development notes

- **Gallery cleanup:** the two `gallery-*.jpg` static files in `public/images/` are no longer referenced anywhere — safe to delete once real photos have been uploaded through `/admin/gallery`, or repurpose them as the first uploads.
- **Chatbot facts stay in sync manually:** `backend/src/config/clinicInfo.ts` is a hand-maintained duplicate of the relevant parts of `src/config/clinic.ts`. If this project grows enough to matter, consider having the backend fetch `GET /api/gallery`-style public data from itself, or generating `clinicInfo.ts` from a shared JSON file at build time — not done yet because the fact set is still small.
- **Chatbot has no memory across page reloads:** conversation state lives in `ChatWidget.tsx`'s React state only. If persistent chat history becomes a requirement, it needs a new backend table and a session identifier — currently out of scope by design (kept simple for a low-traffic FAQ bot).
- **No self-service password change** for either admin or patient accounts yet — see `DEPLOYMENT.md`'s Notes section for the current manual workaround.
- **Real WhatsApp Business API integration** is not built — `WhatsAppButton.tsx` stays a plain `wa.me` link. If this is wanted later it should be a new `backend/src/services/whatsapp.service.ts`, following the same lazy-init/degrade-gracefully pattern as `email.service.ts`/`imageStorage.service.ts`/`chatbot.service.ts` — never build unofficial automation against a personal WhatsApp number.
- **Confirmed clinic hours:** still a placeholder on both the frontend (`clinic.ts`) and backend (`env.ts`'s `CLINIC_*` vars + `clinicInfo.ts`) — update all three together once the clinic confirms real hours.
