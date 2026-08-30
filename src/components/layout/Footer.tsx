import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { clinic, navLinks, services } from "../../config/clinic";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <a href="#home" className="flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              alt={`${clinic.name} logo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-display text-lg font-semibold">{clinic.name}</span>
          </a>
          <p className="text-sm leading-relaxed text-white/70">
            Personalized physiotherapy and rehabilitation support in {clinic.city}, helping
            patients move better and recover with confidence.
          </p>
          <div className="flex gap-3 pt-1">
            <a
              href={clinic.social.facebook}
              aria-label="Aqsa Physiotherapy Centre on Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent"
            >
              <Facebook className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={clinic.social.instagram}
              aria-label="Aqsa Physiotherapy Centre on Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-accent"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-white/80 transition-colors hover:text-accent">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
            Services
          </h3>
          <ul className="flex flex-col gap-2.5">
            {services.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <a href="#services" className="text-sm text-white/80 transition-colors hover:text-accent">
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
            Contact
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-white/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              {clinic.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <a href={clinic.phonePrimaryHref} className="hover:text-accent">
                {clinic.phonePrimary}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <a href={clinic.emailHref} className="hover:text-accent">
                {clinic.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="px-4 text-center text-xs text-white/60">
          © {year} {clinic.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
