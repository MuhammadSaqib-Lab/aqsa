import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "../config/logger";

let client: Resend | undefined;
let attemptedInit = false;

function getClient(): Resend | undefined {
  if (!env.RESEND_API_KEY) return undefined;
  if (!client && !attemptedInit) {
    attemptedInit = true;
    client = new Resend(env.RESEND_API_KEY);
  }
  return client;
}

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

/**
 * Best-effort email send over Resend's HTTPS API (not SMTP — Render blocks
 * outbound SMTP ports, which made the previous Nodemailer transport time
 * out). Never throws — a missing API key or a delivery failure must never
 * fail the appointment/contact submission that triggered it. Callers should
 * not `await` this on the critical path.
 */
export async function sendMail({ to, subject, text }: SendMailInput): Promise<void> {
  const resend = getClient();
  if (!resend) {
    logger.warn(
      { to, subject },
      "Email skipped — RESEND_API_KEY is not set. Configure RESEND_API_KEY/EMAIL_FROM to enable email notifications."
    );
    return;
  }
  if (!env.EMAIL_FROM) {
    logger.warn({ to, subject }, "Email skipped — EMAIL_FROM is not set.");
    return;
  }
  try {
    const { data, error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, text });
    if (error) {
      logger.error({ to, subject, errorName: error.name, errorMessage: error.message }, "Email send failed");
      return;
    }
    logger.info({ to, subject, messageId: data?.id }, "Email sent");
  } catch (err) {
    const sendErr = err as { message?: string };
    logger.error({ to, subject, errorMessage: sendErr.message }, "Email send failed");
  }
}

export function notifyClinicOfNewAppointment(details: {
  patientName: string;
  phone: string;
  email?: string | null;
  preferredDate: string;
  preferredTime: string;
  service: string;
  message?: string | null;
}): void {
  if (!env.CLINIC_NOTIFICATION_EMAIL) return;
  void sendMail({
    to: env.CLINIC_NOTIFICATION_EMAIL,
    subject: `New appointment request — ${details.patientName}`,
    text: [
      `Patient: ${details.patientName}`,
      `Phone: ${details.phone}`,
      details.email ? `Email: ${details.email}` : undefined,
      `Preferred date: ${details.preferredDate}`,
      `Preferred time: ${details.preferredTime}`,
      `Service: ${details.service}`,
      details.message ? `Message: ${details.message}` : undefined,
      "",
      "Status: PENDING — review and confirm in the admin dashboard.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export function notifyPatientOfAppointmentReceived(details: {
  patientEmail: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
}): void {
  void sendMail({
    to: details.patientEmail,
    subject: "We received your appointment request — Aqsa Physiotherapy Centre",
    text: [
      `Hi ${details.patientName},`,
      "",
      `Thank you for your appointment request for ${details.preferredDate} at ${details.preferredTime}.`,
      "This request is pending review — our team will contact you shortly to confirm.",
      "",
      "Aqsa Physiotherapy Centre",
    ].join("\n"),
  });
}

const STATUS_MESSAGES: Record<string, string> = {
  PENDING: "is pending review.",
  CONFIRMED: "has been confirmed.",
  COMPLETED: "has been marked as completed.",
  CANCELLED: "has been cancelled.",
  NO_SHOW: "was marked as a no-show.",
};

export function notifyPatientOfStatusChange(details: {
  patientEmail: string;
  patientName: string;
  status: string;
  preferredDate: string;
  preferredTime: string;
}): void {
  const statusText = STATUS_MESSAGES[details.status] ?? `is now "${details.status}".`;
  void sendMail({
    to: details.patientEmail,
    subject: "Update on your appointment — Aqsa Physiotherapy Centre",
    text: [
      `Hi ${details.patientName},`,
      "",
      `Your appointment for ${details.preferredDate} at ${details.preferredTime} ${statusText}`,
      "Log into your patient portal for the latest details, or call us if you have any questions.",
      "",
      "Aqsa Physiotherapy Centre",
    ].join("\n"),
  });
}

export function notifyClinicOfNewContactMessage(details: {
  name: string;
  phone?: string | null;
  email?: string | null;
  message: string;
}): void {
  if (!env.CLINIC_NOTIFICATION_EMAIL) return;
  void sendMail({
    to: env.CLINIC_NOTIFICATION_EMAIL,
    subject: `New contact message — ${details.name}`,
    text: [
      `From: ${details.name}`,
      details.phone ? `Phone: ${details.phone}` : undefined,
      details.email ? `Email: ${details.email}` : undefined,
      "",
      details.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
