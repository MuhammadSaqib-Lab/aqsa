import { apiRequest } from "../../lib/apiClient";
import type { PatientProfile, PatientAppointment, PatientAppointmentFormValues, PatientReview, Paginated } from "../types";
import type { VisitType } from "../../types";

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
  visitType?: VisitType;
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
      homeAddress: values.visitType === "HOME" ? values.homeAddress.trim() : undefined,
    },
  });
}

export interface ReviewFormValues {
  rating: number;
  reviewText: string;
}

export function createReview(values: ReviewFormValues) {
  return apiRequest<{ id: string }>("/reviews", {
    method: "POST",
    body: { rating: values.rating, reviewText: values.reviewText.trim() || undefined },
  });
}

export function listMyReviews(filters: AppointmentFilters) {
  return apiRequest<Paginated<PatientReview>>(`/patient/reviews${toQueryString(filters)}`);
}
