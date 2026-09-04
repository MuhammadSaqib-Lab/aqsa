import { apiRequest } from "../../lib/apiClient";
import type {
  AdminAppointment,
  AdminContactMessage,
  AdminReview,
  AdminProfile,
  AppointmentStatus,
  ContactStatus,
  ReviewStatus,
  DashboardStats,
  Paginated,
} from "../types";

function toQueryString<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function login(email: string, password: string) {
  return apiRequest<{ admin: AdminProfile; token: string }>("/admin/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return apiRequest<null>("/admin/auth/logout", { method: "POST" });
}

export function me() {
  return apiRequest<AdminProfile>("/admin/auth/me");
}

export function getDashboardStats() {
  return apiRequest<DashboardStats>("/admin/dashboard");
}

export interface AppointmentFilters {
  page: number;
  limit: number;
  status?: AppointmentStatus;
  date?: string;
  search?: string;
}

export function listAppointments(filters: AppointmentFilters) {
  return apiRequest<Paginated<AdminAppointment>>(`/admin/appointments${toQueryString(filters)}`);
}

export function getAppointment(id: string) {
  return apiRequest<AdminAppointment>(`/admin/appointments/${id}`);
}

export function updateAppointment(id: string, data: { status?: AppointmentStatus; adminNotes?: string }) {
  return apiRequest<AdminAppointment>(`/admin/appointments/${id}`, { method: "PATCH", body: data });
}

export interface MessageFilters {
  page: number;
  limit: number;
  status?: ContactStatus;
  search?: string;
}

export function listMessages(filters: MessageFilters) {
  return apiRequest<Paginated<AdminContactMessage>>(`/admin/messages${toQueryString(filters)}`);
}

export function updateMessageStatus(id: string, status: ContactStatus) {
  return apiRequest<AdminContactMessage>(`/admin/messages/${id}`, { method: "PATCH", body: { status } });
}

export function deleteMessage(id: string) {
  return apiRequest<null>(`/admin/messages/${id}`, { method: "DELETE" });
}

export interface ReviewFilters {
  page: number;
  limit: number;
  status?: ReviewStatus;
  search?: string;
}

export function listReviews(filters: ReviewFilters) {
  return apiRequest<Paginated<AdminReview>>(`/admin/reviews${toQueryString(filters)}`);
}

export function getReview(id: string) {
  return apiRequest<AdminReview>(`/admin/reviews/${id}`);
}

export function updateReviewStatus(id: string, status: ReviewStatus) {
  return apiRequest<AdminReview>(`/admin/reviews/${id}`, { method: "PATCH", body: { status } });
}

export function deleteReview(id: string) {
  return apiRequest<null>(`/admin/reviews/${id}`, { method: "DELETE" });
}
