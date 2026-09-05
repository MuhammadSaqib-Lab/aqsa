import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePatientAuth } from "../context/PatientAuthContext";
import { LoadingBlock } from "../../admin/components/LoadingBlock";

export function ProtectedPatientRoute({ children }: { children: ReactNode }) {
  const { status } = usePatientAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-subtle">
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Includes the query string too (e.g. ?visit=home) so intent set before
    // login (like a home-visit booking preference) survives the redirect.
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/patient/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
