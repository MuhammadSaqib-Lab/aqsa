import { clinicHours } from "../config/clinicHours";
import { prisma } from "../lib/prisma";
import { weekdayOf } from "../utils/clinicDate";

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** All slot start times for a working day, independent of bookings. */
function generateAllSlots(): string[] {
  const open = timeToMinutes(clinicHours.openTime);
  const close = timeToMinutes(clinicHours.closeTime);
  const slots: string[] = [];
  for (let t = open; t < close; t += clinicHours.slotMinutes) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"] as const;

export interface AvailabilityResult {
  date: string;
  isWorkingDay: boolean;
  slotMinutes: number;
  slots: string[];
}

/** Returns the still-open slots for a date, excluding ones already booked (non-cancelled). */
export async function getAvailability(date: string): Promise<AvailabilityResult> {
  const isWorkingDay = clinicHours.workingDays.includes(weekdayOf(date));
  if (!isWorkingDay) {
    return { date, isWorkingDay: false, slotMinutes: clinicHours.slotMinutes, slots: [] };
  }

  const booked = await prisma.appointment.findMany({
    where: {
      preferredDate: new Date(`${date}T00:00:00.000Z`),
      status: { in: [...ACTIVE_STATUSES] },
    },
    select: { preferredTime: true },
  });
  const takenTimes = new Set(booked.map((b) => b.preferredTime));

  const slots = generateAllSlots().filter((slot) => !takenTimes.has(slot));
  return { date, isWorkingDay: true, slotMinutes: clinicHours.slotMinutes, slots };
}

/** Used at booking time to reject an obviously conflicting slot. */
export async function isSlotTaken(date: string, time: string): Promise<boolean> {
  const existing = await prisma.appointment.findFirst({
    where: {
      preferredDate: new Date(`${date}T00:00:00.000Z`),
      preferredTime: time,
      status: { in: [...ACTIVE_STATUSES] },
    },
    select: { id: true },
  });
  return Boolean(existing);
}
