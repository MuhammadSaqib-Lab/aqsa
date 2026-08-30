import { env } from "./env";

/**
 * Clinic opening hours, sourced entirely from environment configuration —
 * see CLAUDE.md in the frontend project for why these are still
 * placeholders pending confirmation from the clinic. Nothing here is
 * invented; change the env vars, not this file, once hours are confirmed.
 */
export const clinicHours = {
  timezone: env.CLINIC_TIMEZONE,
  openTime: env.CLINIC_OPEN_TIME,
  closeTime: env.CLINIC_CLOSE_TIME,
  slotMinutes: env.CLINIC_SLOT_MINUTES,
  workingDays: env.CLINIC_WORKING_DAYS.split(",")
    .map((d) => Number.parseInt(d.trim(), 10))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6),
};
