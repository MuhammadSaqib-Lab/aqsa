import { apiRequest } from "../../lib/apiClient";
import type { PatientProfile, PatientAppointment, PatientAppointmentFormValues, Paginated } from "../types";

function toQueryString<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export interface SignupInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export function signup(input: SignupInput) {
  return apiRequest<{ patient: PatientProfile; token: string }>("/patient/auth/signup", {
    method: "POST",
    body: input,
  });
}

export function login(email: string, password: string) {
  return apiRequest<{ patient: PatientProfile; token: string }>("/patient/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest<null>("/patient/auth/logout", { method: "POST" });
}

export function me() {
  return apiRequest<PatientProfile>("/patient/auth/me");
}

export interface AppointmentFilters {
  page: number;
  limit: number;
}

export function listMyAppointments(filters: AppointmentFilters) {
  return apiRequest<Paginated<PatientAppointment>>(`/patient/appointments${toQueryString(filters)}`);
}

export function createAppointment(values: PatientAppointmentFormValues) {
  return apiRequest<{ id: string }>("/appointments", {
    method: "POST",
    body: {
      ...values,
      message: values.message.trim() || undefined,
    },
  });
}
