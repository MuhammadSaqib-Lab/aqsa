export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type ContactStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

export interface AdminAppointment {
  id: string;
  patientName: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  preferredTime: string;
  service: string;
  message: string | null;
  status: AppointmentStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
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

export interface DashboardStats {
  appointments: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
    total: number;
  };
  contactMessages: {
    new: number;
  };
}
