import { clinicHours } from "../config/clinicHours";

/**
 * Timezone-safe date helpers scoped to the clinic's timezone
 * (Asia/Karachi, UTC+5 year-round — Pakistan does not observe DST).
 * Avoids bugs from comparing dates in the server's local timezone.
 */

/** "YYYY-MM-DD" for "now" in the clinic's timezone. */
export function todayInClinicTz(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: clinicHours.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function isValidTimeString(value: string): boolean {
  return TIME_RE.test(value);
}

/** True if `dateStr` (YYYY-MM-DD) is today or later in the clinic's timezone. */
export function isTodayOrFuture(dateStr: string): boolean {
  return dateStr >= todayInClinicTz();
}

/** JS day-of-week (0=Sun..6=Sat) for a YYYY-MM-DD date, timezone-independent by construction. */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
