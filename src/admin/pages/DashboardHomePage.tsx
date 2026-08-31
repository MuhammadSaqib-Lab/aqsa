import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, Clock, MessageSquare, XCircle, UserX } from "lucide-react";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { DashboardStats } from "../types";
import { LoadingBlock } from "../components/LoadingBlock";
import { ErrorBlock } from "../components/ErrorBlock";

const cards = [
  { key: "total" as const, label: "Total Appointments", icon: CalendarClock, accent: "text-primary" },
  { key: "pending" as const, label: "Pending", icon: Clock, accent: "text-amber-600" },
  { key: "confirmed" as const, label: "Confirmed", icon: CheckCircle2, accent: "text-blue-600" },
  { key: "completed" as const, label: "Completed", icon: CheckCircle2, accent: "text-accent" },
  { key: "cancelled" as const, label: "Cancelled", icon: XCircle, accent: "text-red-600" },
  { key: "noShow" as const, label: "No-show", icon: UserX, accent: "text-gray-500" },
];

export function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    setIsLoading(true);
    setError(null);
    adminApi
      .getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load dashboard statistics."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  if (isLoading) return <LoadingBlock label="Loading dashboard…" />;
  if (error || !stats) return <ErrorBlock message={error ?? "Failed to load dashboard statistics."} onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Dashboard</h1>
        <p className="mt-1 text-sm text-text-soft">Live counts from the appointments and messages database.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map(({ key, label, icon: Icon, accent }) => (
          <div key={key} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
            <Icon className={`h-5 w-5 ${accent}`} aria-hidden="true" />
            <p className="mt-3 text-2xl font-semibold text-text">{stats.appointments[key]}</p>
            <p className="mt-1 text-xs text-text-soft">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/appointments"
          className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
        >
          <div>
            <p className="font-medium text-text">Manage appointments</p>
            <p className="mt-1 text-sm text-text-soft">{stats.appointments.pending} pending review</p>
          </div>
          <CalendarClock className="h-6 w-6 text-primary" aria-hidden="true" />
        </Link>
        <Link
          to="/admin/messages"
          className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
        >
          <div>
            <p className="font-medium text-text">Contact messages</p>
            <p className="mt-1 text-sm text-text-soft">{stats.contactMessages.new} new message{stats.contactMessages.new === 1 ? "" : "s"}</p>
          </div>
          <MessageSquare className="h-6 w-6 text-primary" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
