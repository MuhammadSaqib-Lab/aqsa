import { CalendarCheck } from "lucide-react";
import { useAppointment } from "../../context/AppointmentContext";

export function MobileAppointmentBar() {
  const { openAppointment } = useAppointment();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 backdrop-blur-md sm:hidden">
      <button
        type="button"
        onClick={openAppointment}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-card"
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        Book an Appointment
      </button>
    </div>
  );
}
