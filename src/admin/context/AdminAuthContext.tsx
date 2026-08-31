import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as adminApi from "../api/adminApi";
import type { AdminProfile } from "../types";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthContextValue {
  status: Status;
  admin: AdminProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .me()
      .then((profile) => {
        if (cancelled) return;
        setAdmin(profile);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { admin: profile } = await adminApi.login(email, password);
    setAdmin(profile);
    setStatus("authenticated");
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } finally {
      setAdmin(null);
      setStatus("unauthenticated");
    }
  };

  return (
    <AdminAuthContext.Provider value={{ status, admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
