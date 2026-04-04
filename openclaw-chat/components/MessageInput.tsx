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
