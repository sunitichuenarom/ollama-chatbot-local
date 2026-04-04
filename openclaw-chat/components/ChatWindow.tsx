"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "@/lib/context-manager";

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
}

export default function ChatWindow({
  messages,
  isStreaming,
  error,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter out system messages for display
  const visibleMessages = messages.filter((m) => m.role !== "system");

  return (
    <div className="chat-window" ref={scrollRef}>
      {visibleMessages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.5" />
              <circle cx="32" cy="32" r="8" fill="url(#emptyGrad)" opacity="0.3" />
              <path
                d="M20 32C20 25.373 25.373 20 32 20C38.627 20 44 25.373 44 32"
                stroke="url(#emptyGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <defs>
                <linearGradient id="emptyGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            สวัสดี! ฉันคือ OpenClaw AI
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-md text-center">
            ฉันทำงานบนเครื่องของคุณ ด้วย Qwen 3.5 9B — ถามอะไรก็ได้เลย!
          </p>
        </div>
      ) : (
        <div className="messages-container">
          {visibleMessages.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={
                isStreaming &&
                msg.role === "assistant" &&
                index === visibleMessages.length - 1
              }
            />
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 5h2v4H7V5zm0 5h2v2H7v-2z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
