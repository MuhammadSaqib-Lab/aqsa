import type { AppointmentFormValues } from "../types";

/**
 * Frontend-only stand-in for a real appointment booking API.
 *
 * To connect a backend later:
 *   1. Replace the body of this function with a real request, e.g.
 *      `fetch("/api/appointments", { method: "POST", body: JSON.stringify(values) })`.
 *   2. Surface server-side validation errors by throwing an Error with a
 *      user-facing message — the caller already handles the rejected promise.
 *   3. Remove the artificial delay below.
 */
export async function submitAppointmentRequest(
  values: AppointmentFormValues
): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  console.info("[Appointment request — frontend only, not sent anywhere]", values);
  return { ok: true };
}
