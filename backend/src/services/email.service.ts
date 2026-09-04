import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";

let transporter: Transporter | undefined;
let attemptedInit = false;

function getTransporter(): Transporter | undefined {
  if (!env.SMTP_HOST) return undefined;
  if (!transporter && !attemptedInit) {
    attemptedInit = true;
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

/**
 * Best-effort email send. Never throws — a missing SMTP config or a
 * delivery failure must never fail the appointment/contact submission
 * that triggered it. Callers should not `await` this on the critical path.
 */
export async function sendMail({ to, subject, text }: SendMailInput): Promise<void> {
  const client = getTransporter();
  if (!client) {
    logger.warn(
      { to, subject },
      "Email skipped — SMTP_HOST is not set. Configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD to enable email notifications."
    );
    return;
  }
  try {
    const info = await client.sendMail({ from: env.EMAIL_FROM || env.SMTP_USER, to, subject, text });
    logger.info({ to, subject, messageId: info.messageId }, "Email sent");
  } catch (err) {
    const smtpErr = err as { code?: string; responseCode?: number; command?: string; message?: string };
    logger.error(
      {
        to,
        subject,
        errorCode: smtpErr.code,
        smtpResponseCode: smtpErr.responseCode,
        smtpCommand: smtpErr.command,
        errorMessage: smtpErr.message,
      },
      "Email send failed"
    );
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
