import { vi } from "vitest";

function model() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export const mockPrisma = {
  adminUser: model(),
  appointment: model(),
  contactMessage: model(),
  $transaction: vi.fn(async (arg: unknown) => {
    if (Array.isArray(arg)) return Promise.all(arg);
    if (typeof arg === "function") return arg(mockPrisma);
    return arg;
  }),
  $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  $disconnect: vi.fn(),
};

export function resetPrismaMock() {
  vi.clearAllMocks();
  mockPrisma.appointment.findMany.mockResolvedValue([]);
  mockPrisma.appointment.count.mockResolvedValue(0);
  mockPrisma.contactMessage.findMany.mockResolvedValue([]);
  mockPrisma.contactMessage.count.mockResolvedValue(0);
  mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
}
