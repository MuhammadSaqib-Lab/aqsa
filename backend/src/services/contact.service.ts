import type { ContactMessage, ContactStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, toSkipTake } from "../utils/pagination";
import type { PaginatedData } from "../types/api";
import type { CreateContactInput } from "../validators/contact.validators";
import { notifyClinicOfNewContactMessage } from "./email.service";

export async function createContactMessage(input: CreateContactInput): Promise<ContactMessage> {
  const created = await prisma.contactMessage.create({
    data: {
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      message: input.message,
    },
  });

  notifyClinicOfNewContactMessage(created);

  return created;
}

export interface ContactFilters {
  page: number;
  limit: number;
  status?: ContactStatus;
  search?: string;
}

export async function listContactMessages(
  filters: ContactFilters
): Promise<PaginatedData<ContactMessage>> {
  const where: Prisma.ContactMessageWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const { skip, take } = toSkipTake(filters);
  const [items, total] = await prisma.$transaction([
    prisma.contactMessage.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(filters.page, filters.limit, total) };
}

export async function getContactMessageById(id: string): Promise<ContactMessage> {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw ApiError.notFound("Message not found");
  return message;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactStatus
): Promise<ContactMessage> {
  await getContactMessageById(id);
  return prisma.contactMessage.update({ where: { id }, data: { status } });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await getContactMessageById(id);
  await prisma.contactMessage.delete({ where: { id } });
}
