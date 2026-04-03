# Phase 7: Chat UI Components

## File: `components/Header.tsx`

```tsx
"use client";

interface HeaderProps {
  tokenUsage: {
    current: number;
    max: number;
    percentage: number;
    isWarning: boolean;
    isCritical: boolean;
  };
  onClear: () => void;
  isStreaming: boolean;
}

export default function Header({ tokenUsage, onClear, isStreaming }: HeaderProps) {
  return (
    <header className="header-glass">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="logo-glow">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="drop-shadow-lg"
            >
              <circle cx="16" cy="16" r="14" fill="url(#logoGrad)" opacity="0.9" />
              <path
                d="M10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 20C12 17.791 13.791 16 16 16C18.209 16 20 17.791 20 20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="2" fill="white" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              OpenClaw AI
            </h1>
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <span className="text-xs text-gray-400">Qwen 3.5 · Local</span>
            </div>
          </div>
        </div>

        {/* Right: Token Usage + Clear */}
        <div className="flex items-center gap-4">
          {/* Token Usage Bar */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Context</span>
              <div className="token-bar-container">
                <div
                  className={`token-bar-fill ${
                    tokenUsage.isCritical
                      ? "token-critical"
                      : tokenUsage.isWarning
                      ? "token-warning"
                      : "token-normal"
                  }`}
                  style={{ width: `${tokenUsage.percentage}%` }}
                />
              </div>
              <span className="tabular-nums w-12 text-right">
                {Math.round(tokenUsage.percentage)}%
              </span>
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={onClear}
            disabled={isStreaming}
            className="clear-button"
            title="ล้างแชท"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## File: `components/MessageBubble.tsx`

```tsx
"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/context-manager";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function MessageBubbleComponent({ message, isStreaming }: MessageBubbleProps) {
  if (message.role === "system") return null;

  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row-user" : "message-row-ai"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="avatar-ai">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" fill="url(#avatarGrad)" opacity="0.9" />
            <circle cx="10" cy="10" r="3" fill="white" />
            <defs>
              <linearGradient id="avatarGrad" x1="0" y1="0" x2="20" y2="20">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="inline-code" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="code-block">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && message.content.length > 0 && (
              <span className="cursor-blink">▋</span>
            )}
            {isStreaming && message.content.length === 0 && (
              <span className="thinking-dots">
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="avatar-user">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" fill="#374151" />
            <circle cx="10" cy="8" r="3" fill="#9ca3af" />
            <path
              d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6"
              fill="#9ca3af"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleComponent);
```

---

## File: `components/MessageInput.tsx`

```tsx
"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: MessageInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (input.trim() && !isStreaming && !disabled) {
      onSend(input);
      setInput("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [input, isStreaming, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      // Auto-resize
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    },
    []
  );

  return (
    <div className="input-container">
      <div className="input-glass">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ข้อความ... (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
          rows={1}
          disabled={disabled}
          className="chat-textarea"
          id="chat-input"
        />

        {isStreaming ? (
          <button onClick={onStop} className="stop-button" title="หยุด" id="stop-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect x="4" y="4" width="10" height="10" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="send-button"
            title="ส่ง"
            id="send-btn"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 2L8 10M16 2L11 16L8 10L2 7L16 2Z" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        OpenClaw AI · Qwen 3.5 9B · Running locally
      </p>
    </div>
  );
}
```

---

## File: `components/ChatWindow.tsx`

```tsx
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
          <p className="text-gray-400 text-sm mt-2 max-w-md">
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
```
