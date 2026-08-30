import { useEffect } from "react";
import { X, CalendarCheck, Phone } from "lucide-react";
import { clinic, navLinks } from "../../config/clinic";
import { useAppointment } from "../../context/AppointmentContext";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import { Button } from "../ui/Button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string;
}

export function MobileMenu({ isOpen, onClose, activeId }: MobileMenuProps) {
  const { openAppointment } = useAppointment();
  useLockBodyScroll(isOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-primary-dark/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <nav
        aria-label="Mobile"
        className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white p-6 shadow-lift transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-primary-dark">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-2 text-text-soft transition-colors hover:bg-bg-muted hover:text-text"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {navLinks.map((link, index) => {
            const id = link.href.replace("#", "");
            const isActive = activeId === id;
            return (
              <li
                key={link.href}
                className={isOpen ? "animate-fade-up" : ""}
                style={isOpen ? { animationDelay: `${index * 40}ms` } : undefined}
              >
                <a
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive ? "bg-accent-light text-primary" : "text-text hover:bg-bg-muted"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
          <Button
            icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
            iconPosition="left"
            onClick={() => {
              onClose();
              openAppointment();
            }}
          >
            Book an Appointment
          </Button>
          <a
            href={clinic.phonePrimaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {clinic.phonePrimary}
          </a>
        </div>
      </nav>
    </div>
  );
}
