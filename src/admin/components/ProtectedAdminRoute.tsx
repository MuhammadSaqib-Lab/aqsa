import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { LoadingBlock } from "./LoadingBlock";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-subtle">
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
