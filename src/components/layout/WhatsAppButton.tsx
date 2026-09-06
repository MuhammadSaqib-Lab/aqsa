import { MessageCircle } from "lucide-react";
import { clinic } from "../../config/clinic";

export function WhatsAppButton() {
  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-center gap-1 sm:bottom-6">
      <a
        href={clinic.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${clinic.name} on WhatsApp`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-300 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </a>
      <span className="whitespace-nowrap rounded-full bg-white/95 px-2.5 py-0.5 font-display text-[11px] font-light italic text-[#25D366] shadow-soft">
        WhatsApp
      </span>
    </div>
  );
}
