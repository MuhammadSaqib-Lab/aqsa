import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarClock, MessageSquare, LogOut, Menu, X } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useToast } from "../../context/ToastContext";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarClock, end: false },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, end: false },
];

function navLinkClasses(isActive: boolean) {
  return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive ? "bg-primary text-white" : "text-text-muted hover:bg-bg-muted hover:text-text"
  }`;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => navLinkClasses(isActive)}>
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  useLockBodyScroll(isDrawerOpen);

  const handleLogout = async () => {
    await logout();
    showToast("Logged out.");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-subtle">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-text-muted hover:bg-bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-full" />
          <span className="font-display text-lg font-semibold text-primary-dark">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-text-muted sm:inline">{admin?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-bg-muted hover:text-text"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-white lg:flex lg:flex-col">
          <SidebarContent />
        </aside>

        {isDrawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="animate-fade-in fixed inset-0 bg-primary-dark/60" onClick={() => setIsDrawerOpen(false)} aria-hidden="true" />
            <div className="animate-fade-up relative flex h-full w-72 max-w-[80vw] flex-col bg-white shadow-lift">
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <span className="font-display text-lg font-semibold text-primary-dark">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-lg p-2 text-text-muted hover:bg-bg-muted"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setIsDrawerOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
