import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, CalendarCheck } from "lucide-react";
import { clinic, navLinks } from "../../config/clinic";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { useAppointment } from "../../context/AppointmentContext";
import { Button } from "../ui/Button";
import { MobileMenu } from "./MobileMenu";

/**
 * Anchor links (e.g. "#about") only resolve within the current page, but the
 * Navbar is now shared between "/" and "/gallery" — prefixing with "/" makes
 * them always resolve to the home page's sections regardless of which route
 * is currently active (matches the same "/#contact" pattern already used in
 * PatientDashboardPage.tsx). Real route paths (e.g. "/gallery") pass through
 * unchanged.
 */
function resolveNavHref(href: string): string {
  return href.startsWith("#") ? `/${href}` : href;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openAppointment } = useAppointment();
  const sectionIds = navLinks.filter((link) => link.href.startsWith("#")).map((link) => link.href.slice(1));
  const activeId = useScrollSpy(sectionIds);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 shadow-soft backdrop-blur-md"
          : "bg-white/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/#home" className="flex items-center gap-2.5">
          <img
            src="/images/logo.png"
            alt={`${clinic.name} logo`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-display text-lg font-semibold leading-tight text-primary-dark sm:text-xl">
            {clinic.name}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center">
            {navLinks.map((link) => {
              const isHash = link.href.startsWith("#");
              const isActive = isHash && activeId === link.href.slice(1);
              const linkClassName = `relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                isActive ? "text-primary" : "text-text-muted hover:text-primary"
              }`;
              return (
                <li key={link.href} className="shrink-0">
                  {isHash ? (
                    <a href={resolveNavHref(link.href)} aria-current={isActive ? "page" : undefined} className={linkClassName}>
                      {link.label}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                      )}
                    </a>
                  ) : (
                    <Link to={link.href} className={linkClassName}>
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Button
              size="md"
              icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
              iconPosition="left"
              onClick={openAppointment}
            >
              Book an Appointment
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            className="rounded-full p-2.5 text-primary-dark transition-colors hover:bg-bg-muted xl:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
    <MobileMenu
      isOpen={isMobileMenuOpen}
      onClose={() => setIsMobileMenuOpen(false)}
      activeId={activeId}
    />
    </>
  );
}
