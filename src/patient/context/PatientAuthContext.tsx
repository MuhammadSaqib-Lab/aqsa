import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as patientApi from "../api/patientApi";
import type { PatientProfile } from "../types";
import type { SignupInput } from "../api/patientApi";

type Status = "loading" | "authenticated" | "unauthenticated";

interface PatientAuthContextValue {
  status: Status;
  patient: PatientProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextValue | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [patient, setPatient] = useState<PatientProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    patientApi
      .me()
      .then((profile) => {
        if (cancelled) return;
        setPatient(profile);
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
    const { patient: profile } = await patientApi.login(email, password);
    setPatient(profile);
    setStatus("authenticated");
  };

  const signup = async (input: SignupInput) => {
    const { patient: profile } = await patientApi.signup(input);
    setPatient(profile);
    setStatus("authenticated");
  };

  const logout = async () => {
    try {
      await patientApi.logout();
    } finally {
      setPatient(null);
      setStatus("unauthenticated");
    }
  };

  return (
    <PatientAuthContext.Provider value={{ status, patient, login, signup, logout }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth(): PatientAuthContextValue {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error("usePatientAuth must be used within a PatientAuthProvider");
  return ctx;
}
