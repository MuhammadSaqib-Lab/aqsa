import { prisma } from "../lib/prisma";

export async function getDashboardStats() {
  const [pending, confirmed, completed, cancelled, noShow, newMessages] = await prisma.$transaction([
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.count({ where: { status: "NO_SHOW" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  return {
    appointments: {
      pending,
      confirmed,
      completed,
      cancelled,
      noShow,
      total: pending + confirmed + completed + cancelled + noShow,
    },
    contactMessages: { new: newMessages },
  };
}
