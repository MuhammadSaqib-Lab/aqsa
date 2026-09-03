import { z } from "zod";

const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

/** Lowercased so self-signup doesn't create "Test@x.com" and "test@x.com" as two accounts. */
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .max(200);

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: emailField,
  phone: z.string().trim().regex(PHONE_RE, "Please enter a valid phone number.").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;
