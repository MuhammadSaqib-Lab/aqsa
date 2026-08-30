import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { getAvailability } from "../../src/services/availability.service";

function nextWeekday(target: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7); // push a week out to avoid "today" edge cases
  while (d.getUTCDay() !== target) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

describe("availability.service", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns all 22 default slots open on a working weekday with no bookings", async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([]);
    const result = await getAvailability(nextWeekday(1)); // Monday
    expect(result.isWorkingDay).toBe(true);
    expect(result.slots).toHaveLength(22);
    expect(result.slots[0]).toBe("09:00");
    expect(result.slots.at(-1)).toBe("19:30");
  });

  it("excludes already-booked slots", async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([{ preferredTime: "09:00" }]);
    const result = await getAvailability(nextWeekday(2)); // Tuesday
    expect(result.slots).toHaveLength(21);
    expect(result.slots).not.toContain("09:00");
  });

  it("returns no slots on a non-working day", async () => {
    const result = await getAvailability(nextWeekday(0)); // Sunday
    expect(result.isWorkingDay).toBe(false);
    expect(result.slots).toEqual([]);
  });
});
