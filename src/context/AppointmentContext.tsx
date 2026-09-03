import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AppointmentContextValue {
  openAppointment: () => void;
}

const AppointmentContext = createContext<AppointmentContextValue | undefined>(undefined);

/**
 * Booking now requires a patient account — this used to open a modal
 * directly; it now sends visitors to the booking page inside the patient
 * portal, which redirects to login/signup first if they aren't already
 * signed in (see ProtectedPatientRoute). Kept as the same openAppointment()
 * hook shape so none of its call sites (Navbar, Hero, AppointmentCTA,
 * MobileAppointmentBar, MobileMenu) need to change.
 */
export function AppointmentProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const value = useMemo<AppointmentContextValue>(
    () => ({ openAppointment: () => navigate("/patient/new-appointment") }),
    [navigate]
  );

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
}

export function useAppointment(): AppointmentContextValue {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointment must be used within an AppointmentProvider");
  return ctx;
}
