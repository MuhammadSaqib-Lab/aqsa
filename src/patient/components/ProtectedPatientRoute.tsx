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
    const redirect = encodeURIComponent(location.pathname);
    return <Navigate to={`/patient/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
