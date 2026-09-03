import type { LucideIcon } from "lucide-react";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type ContactStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export interface NavLink {
  label: string;
  href: string;
}

export interface Service {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
}

export interface Condition {
  icon: LucideIcon;
  name: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ProcessStepData {
  number: string;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  initials: string;
  category?: string;
  quote: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TeamMember {
  name: string;
  role: string;
  credentials: string[];
  image: string;
  bio: string;
}

export interface AppointmentFormValues {
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  service: string;
  message: string;
}
