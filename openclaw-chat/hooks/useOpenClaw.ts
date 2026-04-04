"use client";

import { useState, useCallback, useRef } from "react";
import {
  ChatMessage,
  applySlidingWindow,
  getTokenUsage,
} from "@/lib/context-manager";

// Generate unique ID
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_SYSTEM_PROMPT ||
  "You are OpenClaw AI, a friendly and helpful assistant running on local hardware. You are powered by Qwen 3.5 9B. Be concise but thorough. You can respond in Thai or English depending on the user's language.";

const MAX_INPUT_TOKENS = Number(
  process.env.NEXT_PUBLIC_MAX_INPUT_TOKENS || "20000"
);

export interface UseOpenClawReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  tokenUsage: {
    current: number;
    max: number;
    percentage: number;
    isWarning: boolean;
    isCritical: boolean;
  };
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  stopStreaming: () => void;
}

export function useOpenClaw(): UseOpenClawReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: "system",
      content: SYSTEM_PROMPT,
      timestamp: Date.now(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const tokenUsage = getTokenUsage(messages, MAX_INPUT_TOKENS);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      // 1. Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // 2. Apply sliding window BEFORE sending
      const windowResult = applySlidingWindow(updatedMessages, MAX_INPUT_TOKENS);

      if (windowResult.droppedCount > 0) {
        console.log(
          `[Context Manager] Dropped ${windowResult.droppedCount} old messages. ` +
            `Sending ${windowResult.messages.length} messages (${windowResult.totalTokens} tokens)`
        );
      }

      // 3. Create placeholder for assistant response
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsStreaming(true);

      // 4. Call API with streaming
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: windowResult.messages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API Error: ${response.status}`
          );
        }

        // 5. Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  // Update assistant message with accumulated content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("[useOpenClaw] Streaming aborted by user");
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error occurred";
          setError(errorMessage);
          console.error("[useOpenClaw] Error:", errorMessage);

          // Remove empty assistant message on error
          setMessages((prev) =>
            prev.filter(
              (msg) =>
                msg.id !== assistantMessage.id || msg.content.length > 0
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: generateId(),
        role: "system",
        content: SYSTEM_PROMPT,
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    tokenUsage,
    sendMessage,
    clearMessages,
    stopStreaming,
  };
}
