import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { sendChatMessage, type ChatMessage } from "../../lib/chatApi";
import { ApiRequestError } from "../../lib/apiClient";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const { reply } = await sendChatMessage(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-40 right-5 z-50 sm:bottom-24">
      {isOpen ? (
        <div className="flex h-[480px] max-h-[70vh] w-[340px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-lift">
          <div className="flex items-center justify-between bg-primary px-4 py-3.5 text-white">
            <span className="font-display text-base font-semibold">Batkh🦆</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-bg-muted px-3.5 py-2.5 text-sm text-text">
              Hi! I&apos;m Batkh 🦆 — ask me about our hours, services, or how to book an appointment.
            </div>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${
                  message.role === "user"
                    ? "ml-auto rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm bg-bg-muted text-text"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-bg-muted px-3.5 py-2.5 text-sm text-text-soft">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Type a message"
              maxLength={2000}
              className="flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Batkh chat assistant"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lift transition-transform duration-300 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
