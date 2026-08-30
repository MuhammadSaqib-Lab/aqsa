# Aqsa Physiotherapy Centre — Website

A modern, responsive marketing website for Aqsa Physiotherapy Centre, a physiotherapy and rehabilitation clinic in Haripur, Khyber Pakhtunkhwa, Pakistan.

Frontend-only — there is no backend, database, authentication, or payment processing. All content is static and client-side, with the appointment form ready to connect to a real API later.

## Features

- Sticky, scroll-aware navigation with mobile drawer menu and active-section highlighting
- Hero section with trust indicators and clinic imagery
- About, Services, Conditions, Why Choose Us, Treatment Process, Testimonials, and FAQ sections
- Accessible appointment booking modal with full client-side validation, loading/success/error states
- Contact section with phone/WhatsApp/email/address, hours, and a map embed
- Scroll progress bar, back-to-top button, floating WhatsApp button, mobile bottom appointment bar
- Custom 404 page
- Scroll-reveal animations that respect `prefers-reduced-motion`
- Fully responsive (mobile, tablet, laptop, desktop)

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev/build tooling
- [Tailwind CSS v4](https://tailwindcss.com/) (theme tokens in `src/index.css`)
- [React Router](https://reactrouter.com/) for routing
- [lucide-react](https://lucide.dev/) for icons

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

### Other commands

```bash
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
npm run lint       # run ESLint
```

## Project structure

```
src/
  config/clinic.ts        # All clinic content — name, contact info, hours, services,
                           # conditions, features, process steps, FAQs, team, testimonials
  pages/                  # Home and 404 pages
  components/
    layout/               # Navbar, mobile menu, footer, scroll progress, back-to-top, WhatsApp button
    sections/              # One component per homepage section
    cards/                 # Reusable card components (service, condition, feature, team, etc.)
    forms/                 # Appointment form and FAQ accordion
    ui/                    # Button, Modal, SectionHeading, scroll-reveal wrapper
  context/                # Toast notifications and appointment modal state
  hooks/                  # Scroll spy, scroll progress, reduced motion, intersection observer, etc.
  lib/appointmentApi.ts   # Appointment form submission — stubbed, ready for a real backend
public/
  images/                 # Logo, team photos, and clinic photos used on the site
```

See [CLAUDE.md](CLAUDE.md) for a full file-by-file breakdown and the current clinic data reference.

## Editing content

All site copy lives in one file: [src/config/clinic.ts](src/config/clinic.ts). Update contact details, services, conditions, testimonials, FAQs, or team bios there — no component changes needed.

To restyle the site, edit the CSS variables (`--color-primary`, `--color-accent`, etc.) in [src/index.css](src/index.css).

## Before launch

A few placeholders still need real information before this goes live:

- **Testimonials** — currently placeholder reviews; replace with real, consented patient reviews
- **Opening hours** — unconfirmed, verify with the clinic
- **Map embed** — currently a text-query embed, not a verified pin
- **Facebook/Instagram links** — currently `#`; the clinic's Facebook page name is known ("Aqsa Physio Therpy") but not its URL

## Connecting a real backend

The appointment form (`src/components/forms/AppointmentForm.tsx`) is fully built with validation and UI states. To wire it up to a real backend, only `submitAppointmentRequest` in [src/lib/appointmentApi.ts](src/lib/appointmentApi.ts) needs to change.
