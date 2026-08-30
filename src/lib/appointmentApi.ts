import type { AppointmentFormValues } from "../types";
import { apiRequest } from "./apiClient";

/**
 * Submits an appointment request to the backend (POST /api/appointments).
 * Resolves with the created appointment's id on success; throws
 * ApiRequestError (via apiRequest) with a user-facing message on failure,
 * which AppointmentForm's existing catch block already surfaces as a toast.
 */
export async function submitAppointmentRequest(
  values: AppointmentFormValues
): Promise<{ id: string }> {
  return apiRequest<{ id: string }>("/appointments", {
    method: "POST",
    body: {
      ...values,
      email: values.email.trim() || undefined,
      message: values.message.trim() || undefined,
    },
  });
}
