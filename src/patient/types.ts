import type { AppointmentStatus, ReviewStatus, VisitType, Gender } from "../types";

export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

/**
 * Deliberately its own interface, not a reuse/subset of the admin
 * AdminAppointment type — it must never gain an adminNotes field just
 * because someone extends the admin shape later.
 */
export interface PatientAppointment {
  id: string;
  patientName: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  preferredTime: string;
  service: string;
  message: string | null;
  status: AppointmentStatus;
  visitType: VisitType;
  homeAddress: string | null;
  gender: Gender | null;
  createdAt: string;
  updatedAt: string;
}

/** No email field — booking always uses the logged-in account's email. */
export interface PatientAppointmentFormValues {
  fullName: string;
  phone: string;
  gender: Gender | "";
  preferredDate: string;
  preferredTime: string;
  service: string;
  message: string;
  visitType: VisitType;
  homeAddress: string;
}

export interface PatientReview {
  id: string;
  rating: number;
  reviewText: string | null;
  status: ReviewStatus;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}
