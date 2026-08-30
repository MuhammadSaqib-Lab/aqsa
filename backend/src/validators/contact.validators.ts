import { z } from "zod";
import { paginationSchema } from "./pagination.validators";

const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

export const createContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  phone: z.string().trim().regex(PHONE_RE, "Please enter a valid phone number.").optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email address.").max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Please enter a message.").max(2000),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const contactStatusEnum = z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]);

export const updateContactSchema = z.object({
  status: contactStatusEnum,
});

export const contactFiltersSchema = paginationSchema.extend({
  status: contactStatusEnum.optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid id"),
});
