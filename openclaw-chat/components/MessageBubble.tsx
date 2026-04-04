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
      {/* AI Avatar */}
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

      {/* User Avatar */}
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
