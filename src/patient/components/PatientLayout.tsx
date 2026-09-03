import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { usePatientAuth } from "../context/PatientAuthContext";
import { useToast } from "../../context/ToastContext";

const navItems = [
  { to: "/patient", label: "My Appointments", end: true },
  { to: "/patient/new-appointment", label: "Book an Appointment", end: false },
];

function navLinkClasses(isActive: boolean) {
  return `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive ? "bg-primary text-white" : "text-text-muted hover:bg-bg-muted hover:text-text"
  }`;
}

export function PatientLayout() {
  const { patient, logout } = usePatientAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast("Logged out.");
    navigate("/patient/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            <span className="font-display text-lg font-semibold text-primary-dark">Patient Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-text-muted sm:inline">{patient?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-bg-muted hover:text-text"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4 pb-3 sm:px-6" aria-label="Patient portal">
          {navItems.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => navLinkClasses(isActive)}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
