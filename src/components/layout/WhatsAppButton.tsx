import { MessageCircle } from "lucide-react";
import { clinic } from "../../config/clinic";

export function WhatsAppButton() {
  return (
    <a
      href={clinic.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${clinic.name} on WhatsApp`}
      className="fixed bottom-24 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-300 hover:scale-105 sm:bottom-6"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
