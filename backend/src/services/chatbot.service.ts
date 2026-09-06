import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { buildChatSystemPrompt } from "../config/clinicInfo";

let client: Anthropic | undefined;
let attemptedInit = false;

/** Lazy singleton, mirroring email.service.ts's Resend pattern — a missing key must never crash the server. */
function getClient(): Anthropic | undefined {
  if (!env.ANTHROPIC_API_KEY) return undefined;
  if (!client && !attemptedInit) {
    attemptedInit = true;
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "claude-haiku-4-5";

export async function getChatReply(history: ChatMessage[]): Promise<string> {
  const anthropic = getClient();
  if (!anthropic) {
    logger.warn("Chat request received but ANTHROPIC_API_KEY is not set.");
    throw ApiError.internal("The chat assistant is not configured yet — please call the clinic directly.");
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildChatSystemPrompt(),
      messages: history,
    });

    const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
    if (!textBlock) {
      throw ApiError.internal("The chat assistant could not generate a reply. Please try again.");
    }
    return textBlock.text;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Anthropic.RateLimitError) {
      logger.warn("Chat request rate-limited by Anthropic");
      throw ApiError.tooManyRequests("The chat assistant is busy right now — please try again in a moment.");
    }
    if (err instanceof Anthropic.AuthenticationError) {
      logger.error("Anthropic authentication failed — check ANTHROPIC_API_KEY");
      throw ApiError.internal("The chat assistant is not configured correctly — please call the clinic directly.");
    }
    if (err instanceof Anthropic.APIError) {
      logger.error({ errorMessage: err.message }, "Anthropic API error");
      throw ApiError.internal("The chat assistant is temporarily unavailable. Please try again shortly.");
    }
    logger.error({ err }, "Unexpected chat error");
    throw ApiError.internal("The chat assistant is temporarily unavailable. Please try again shortly.");
  }
}
