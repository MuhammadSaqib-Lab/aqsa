import { z } from "zod";

export const chatMessageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000, "Message is too long."),
      })
    )
    .min(1, "At least one message is required.")
    .max(30, "Conversation is too long."),
});
export type ChatRequestInput = z.infer<typeof chatMessageSchema>;
