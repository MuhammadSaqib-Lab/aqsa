import { apiRequest } from "./apiClient";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function sendChatMessage(messages: ChatMessage[]) {
  return apiRequest<{ reply: string }>("/chat", { method: "POST", body: { messages }, timeoutMs: 30_000 });
}
