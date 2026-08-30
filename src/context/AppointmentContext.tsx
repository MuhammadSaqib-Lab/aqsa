import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "../components/ui/Modal";
import { AppointmentForm } from "../components/forms/AppointmentForm";

interface AppointmentContextValue {
  openAppointment: () => void;
}

const AppointmentContext = createContext<AppointmentContextValue | undefined>(undefined);

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<AppointmentContextValue>(
    () => ({ openAppointment: () => setIsOpen(true) }),
    []
  );

  return (
    <AppointmentContext.Provider value={value}>
      {children}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Book an Appointment">
        <AppointmentForm onSuccess={() => undefined} />
      </Modal>
    </AppointmentContext.Provider>
  );
}

export function useAppointment(): AppointmentContextValue {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointment must be used within an AppointmentProvider");
  return ctx;
}
