# Aqsa Physiotherapy Centre — Website

Marketing site for Aqsa Physiotherapy Centre (Haripur, KPK, Pakistan), with a companion
backend API. No payment system.

**Two independent projects in this repo:**
- Project root (`src/`, this file) — the frontend, documented below.
- [`backend/`](backend/) — separate Node/Express/PostgreSQL/Prisma API with its own
  `package.json`, own `CLAUDE.md`-equivalent in [`backend/README.md`](backend/README.md).
  The frontend only talks to it over HTTP via `VITE_API_URL`; nothing is shared/imported
  between the two.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`; theme tokens live in `src/index.css` under `:root` / `@theme inline`, not a `tailwind.config.js`)
- React Router — public site at `/` (all in-page sections are anchor-linked), admin dashboard under `/admin/*`, `*` renders `NotFound`
- lucide-react for icons

## Commands

```bash
npm install
npm run dev       # start dev server (Vite, default port 5173)
npm run build     # tsc -b && vite build
npm run lint       # eslint .
npm run preview   # preview the production build
```

Last verified: `npm run build` compiles clean (no TS errors); `npm run lint` returns 0 errors (3 benign `react-refresh/only-export-components` warnings on `AppointmentContext.tsx`, `ToastContext.tsx`, and `AdminAuthContext.tsx`, expected for files exporting both a provider component and a hook).

## Admin dashboard (`src/admin/`)

Separate route tree, same app — `/admin/login` and `/admin/*` (dashboard home, appointments, messages), added as sibling `<Route>`s in `App.tsx` alongside the public `/` route (no public-site chrome — Navbar/Footer/etc. — renders there). Auth is a session cookie set by the backend (`GET /api/admin/auth/me` on load decides authenticated/unauthenticated; unauthenticated users are redirected to `/admin/login`).

- `admin/api/adminApi.ts` — thin wrapper over the same `lib/apiClient.ts` used by the public site; no duplicate fetch logic.
- `admin/context/AdminAuthContext.tsx` — session state (`loading`/`authenticated`/`unauthenticated`), `login()`/`logout()`.
- `admin/components/` — `AdminLayout` (sidebar + topbar shell, responsive mobile drawer), `ProtectedAdminRoute`, `AppointmentDetailModal` / `MessageDetailModal` (status actions, admin notes, delete), `StatusBadge`, `Pagination`, `ConfirmDialog`, `EmptyState`/`LoadingBlock`/`ErrorBlock`.
- `admin/pages/` — `AdminLoginPage`, `DashboardHomePage` (live counts from `GET /api/admin/dashboard`), `AppointmentsPage`, `MessagesPage` (both paginated, filterable, searchable — search is debounced via `hooks/useDebouncedValue.ts`).
- All data is real — every number/row comes from PostgreSQL through the existing `backend/` admin API. No mock/fake dashboard data.
- `components/ui/Modal.tsx` gained an optional `maxWidthClassName` prop (default unchanged, `max-w-lg`) so admin detail modals can be wider — backward compatible with the existing appointment-booking modal.

## Full project structure

```
src/
  main.tsx                          # ReactDOM root, wraps App in BrowserRouter
  App.tsx                           # Router + ToastProvider + AppointmentProvider, route table
  index.css                         # Tailwind v4 import, :root theme tokens, @theme inline mapping, global styles/animations
  vite-env.d.ts

  pages/
    Home.tsx                        # Assembles all sections in order for the `/` route
    NotFound.tsx                    # Custom 404 page

  config/
    clinic.ts                       # SINGLE SOURCE OF TRUTH for all site copy/data (see below)

  types/
    index.ts                       # Shared TS interfaces: NavLink, Service, Condition, Feature,
                                     # ProcessStepData, Testimonial, FAQItem, TeamMember, AppointmentFormValues

  context/
    ToastContext.tsx                # Toast notification provider + useToast() hook
    AppointmentContext.tsx          # Appointment modal open/close state + useAppointment() hook
                                     # (consumed by Navbar, Hero, AppointmentCTA, MobileAppointmentBar)

  hooks/
    useLockBodyScroll.ts            # Locks <body> scroll while a modal/drawer is open
    useOnScreen.ts                  # IntersectionObserver hook, powers scroll-reveal animations
    useReducedMotion.ts             # Reads prefers-reduced-motion, used to gate animations
    useScrollProgress.ts            # Powers the top ScrollProgressBar
    useScrollSpy.ts                 # Tracks which section is in view, powers Navbar active-link state

  lib/
    apiClient.ts                    # Centralized fetch client for backend/ — base URL (VITE_API_URL),
                                     # JSON headers, timeout/abort, and error normalization (ApiRequestError).
    appointmentApi.ts               # submitAppointmentRequest() — POSTs to backend/'s /api/appointments
                                     # via apiClient. Resolves { id } on success, throws ApiRequestError
                                     # (with the server's message) on failure.

  components/
    layout/
      Navbar.tsx                    # Sticky header, scroll-aware style change, active-section highlighting, CTA button
      MobileMenu.tsx                # Slide-in mobile nav drawer (triggered from Navbar hamburger)
      Footer.tsx                    # Logo/description, quick links, services list, contact, social placeholders, copyright
      ScrollProgressBar.tsx         # Thin fixed progress bar tied to scroll position
      BackToTopButton.tsx           # Fixed button, appears after scrolling, smooth-scrolls to top
      WhatsAppButton.tsx            # Fixed floating WhatsApp CTA (links to clinic.whatsappHref)
      MobileAppointmentBar.tsx      # Fixed bottom "Book an Appointment" bar, mobile only

    sections/                       # One file per Home.tsx section, in page order
      Hero.tsx                      # Headline, subcopy, CTA buttons, trust indicators, floating cards, clinic image
      About.tsx                     # Centre intro, mission, patient-centered approach, non-numeric stat highlights
      Services.tsx                  # Grid of ServiceCard from `services` config
      Conditions.tsx                # Pill/card grid of ConditionCard from `conditions` config + assessment disclaimer
      WhyChooseUs.tsx                # Grid of FeatureCard from `features` config
      Process.tsx                   # 4-step ProcessStep timeline from `processSteps` config
      Testimonials.tsx              # Carousel/grid of TestimonialCard from `testimonials` config (placeholder data)
      FAQSection.tsx                 # FAQAccordion wrapper using `faqs` config
      AppointmentCTA.tsx            # Conversion banner section, opens the appointment modal
      Contact.tsx                   # ContactCard(s) for phone/WhatsApp/email/address/hours + map embed

    cards/
      ServiceCard.tsx
      ConditionCard.tsx
      FeatureCard.tsx
      ProcessStep.tsx
      TestimonialCard.tsx
      TeamCard.tsx
      ContactCard.tsx

    forms/
      AppointmentForm.tsx           # Full client-side validation, loading/success/error states, accessible markup.
                                     # Submits via lib/appointmentApi.ts — see "Backend work" below.
      FAQAccordion.tsx

    ui/
      Button.tsx                    # Shared button component (variants used across CTAs)
      Modal.tsx                     # Accessible dialog primitive (used for the appointment modal), Escape-to-close,
                                     # focus handling, backdrop
      Reveal.tsx                    # Wraps children with the useOnScreen scroll-reveal fade/slide-up animation
      SectionHeading.tsx            # Shared eyebrow/title/subtitle heading used at the top of every section

public/
  robots.txt
  images/
    logo.png                        # Clinic logo (used in Navbar/Footer)
    doctor-amjad-awan.jpg            # Cropped/optimized team portrait
    doctor-sahil.jpg                 # Cropped/optimized team portrait
    clinic-manual-therapy.jpg        # Clinic/treatment photo (used in Hero/About)
    clinic-band-exercise.jpg         # Clinic/treatment photo
    og-cover.jpg                     # Open Graph social preview image
```

Project root also still contains the **original, unprocessed marketing assets** the images above were cropped/optimized from (Facebook-exported photos, a clinic video, and raw doctor photos: `102563896_...jpg`, `483369169_...jpg`, `483509717_...jpg`, `484092721_...jpg`, `484110461_...jpg`, `484650548_...jpg`, `514520329_...jpg`, `515372070_...jpg`, `656957279_...jpg`, one `.mp4`, `Dr Muhammad Amjad awan.jfif`/`.jpg`, `Dr sahil pt.jpg`). These are source material, not referenced by the site — pull from them if more/replacement images are needed in `public/images/`.

## Clinic data (`src/config/clinic.ts`) — current values

This is the single source of truth for every piece of copy on the site. Editing this file updates the whole site without touching components.

- **Name / tagline:** Aqsa Physiotherapy Centre — "Move Better. Feel Stronger. Live Without Limits."
- **Location:** Haripur, Khyber Pakhtunkhwa, Pakistan — address: "Tarbela Road, near District Council, Haripur, KPK, Pakistan"
- **Phone:** 0314-2247280 (primary / WhatsApp), 0345-5131814 (secondary)
- **Email:** Muhammadamjad2812@gmail.com
- **Hours (placeholder, unconfirmed):** Mon–Sat 9:00 AM–8:00 PM, Sunday by appointment
- **Map:** text-query Google Maps embed for "Tarbela Road, Haripur, Pakistan" (not a verified pin)
- **Social:** Facebook/Instagram both `#` placeholders (real Facebook page name known: "Aqsa Physio Therpy", URL not known)
- **Services (8):** Pain Management, Sports Injury Rehabilitation, Back & Neck Pain, Post-Surgical Rehabilitation, Joint Rehabilitation, Exercise Therapy, Posture & Mobility, Neurological Rehabilitation — each with icon, description, and 3 detail bullets
- **Conditions (12):** Back Pain, Neck Pain, Shoulder Pain, Knee Pain, Sports Injuries, Joint Stiffness & Arthritis, Muscle Strain, Post-Surgical Recovery, Mobility Problems, Posture-Related Issues, Stroke Recovery, Paediatric Conditions
- **Features / Why Choose Us (6):** Personalized Treatment, Patient-Centered Care, Professional Approach, Functional Recovery, Supportive Environment, Ongoing Guidance
- **Process (4 steps):** 01 Initial Assessment → 02 Personalized Plan → 03 Guided Treatment → 04 Progress & Recovery
- **Testimonials (5, explicitly placeholder):** Imran S. (Back Pain), Ayesha K. (Post-Surgical Rehabilitation), Bilal R. (Sports Injury), Sana M. (Neck & Shoulder Pain), Waqas A. (Joint Rehabilitation)
- **FAQs (7):** first-visit expectations, session length, whether an appointment is needed, what to wear, how many sessions, whether physio helps back pain, continuing normal activities — all worded to avoid medical promises
- **Team (2):**
  - **Dr. Muhammad Amjad Awan** — Founder & Physiotherapist. Credentials: DPT (Pakistan), DHPMS (Pakistan), OT (Florence, Italy), BLS (Pakistan), MA, MSc (Pakistan), Ex-Physiotherapist Pakistan Navy. Bio references PNS Shifa Naval Hospital (Karachi) and PNS Hafeez Naval Hospital (Islamabad).
  - **Dr. Sahil** — Physiotherapist, supports patients through guided exercise therapy and hands-on rehabilitation.

All of the above (except testimonials, hours, map pin, and social URLs) is transcribed from the clinic's own printed marketing material — not invented.

## Content rules (carried over from the original brief)

- No fabricated patient counts, awards, doctor credentials, or years of experience. Only the qualifications transcribed from the clinic's own printed material (in `clinic.ts`) are presented as fact.
- Testimonials in `clinic.ts` are explicitly placeholder — replace with real, consented reviews before launch, keeping the same `Testimonial` shape.
- Opening hours are a placeholder pending confirmation from the clinic — verify before launch.
- The Google Maps embed uses a text-query embed (`clinic.mapEmbedSrc`), not a verified pin — replace with the exact location once confirmed.
- Facebook/Instagram links in `clinic.social` are placeholders (`#`) — the clinic's real Facebook page name is known ("Aqsa Physio Therpy") but not its URL.

## Backend integration

The appointment form (`src/components/forms/AppointmentForm.tsx`) now submits to the real backend in [`backend/`](backend/) — see [backend/README.md](backend/README.md) for how to run it (PostgreSQL + Prisma, `npm run dev` inside `backend/`). Frontend changes made for this:

- `src/lib/appointmentApi.ts` calls `POST /api/appointments` via the new `src/lib/apiClient.ts` (base URL from `VITE_API_URL`, see `.env.example`), instead of the old `setTimeout` stub.
- `AppointmentForm.tsx`'s success message and fine-print disclaimer were updated (content only, not redesigned) because they used to claim "no appointment is booked on a server" — that's no longer true; submissions are now saved with `status: PENDING`.
- The form's error toast now surfaces the backend's actual validation/error message instead of a generic one.

The backend independently re-validates everything the frontend already validates — never assume the frontend's checks are sufficient on their own.

## Verification history

- Build/lint verified clean as of 2026-08-30.
- Manually verified in-browser: hero renders, appointment modal opens, empty-form validation fires per-field errors, valid submission shows success state + toast, mobile hamburger menu opens a full-width drawer with active-link highlighting, layout holds at 375px mobile width with no overflow.
