# Phase 9: Global Styles

## File: `app/globals.css`

```css
@import "tailwindcss";

/* ============================
   CSS Variables & Base
   ============================ */

:root {
  --bg-primary: #0a0a1a;
  --bg-secondary: #111127;
  --glass-bg: rgba(15, 15, 40, 0.7);
  --glass-border: rgba(139, 92, 246, 0.15);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  --purple: #8b5cf6;
  --cyan: #22d3ee;
  --pink: #f472b6;

  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* ============================
   Custom Scrollbar
   ============================ */

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--purple), var(--cyan));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--cyan), var(--pink));
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--purple) transparent;
}

/* ============================
   App Layout
   ============================ */

.app-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-layout {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 850px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

@media (min-width: 768px) {
  .chat-layout {
    height: 92vh;
    max-height: 900px;
    padding: 24px;
  }
}

/* ============================
   Header — Glassmorphism
   ============================ */

.header-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}

.logo-glow {
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5)); }
  50% { filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.6)); }
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
  animation: status-pulse 2s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Token Bar */
.token-bar-container {
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.token-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease, background 0.3s ease;
}

.token-normal {
  background: linear-gradient(90deg, var(--purple), var(--cyan));
}

.token-warning {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}

.token-critical {
  background: #ef4444;
  animation: token-flash 0.5s ease infinite;
}

@keyframes token-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Clear Button */
.clear-button {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.clear-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ============================
   Chat Window
   ============================ */

.chat-window {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 4px;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0.9;
}

.empty-icon {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

/* ============================
   Message Bubbles
   ============================ */

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: message-in 0.3s ease-out;
}

.message-row-user {
  justify-content: flex-end;
}

.message-row-ai {
  justify-content: flex-start;
}

@keyframes message-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Avatars */
.avatar-ai,
.avatar-user {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.avatar-ai {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.avatar-user {
  background: rgba(55, 65, 81, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

/* Bubbles */
.bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.bubble-user {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(34, 211, 238, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-bottom-right-radius: 4px;
  color: var(--text-primary);
}

.bubble-ai {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-bottom-left-radius: 4px;
  color: var(--text-primary);
}

/* ============================
   Markdown Styles (AI messages)
   ============================ */

.markdown-body p {
  margin-bottom: 8px;
}

.markdown-body p:last-child {
  margin-bottom: 0;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 20px;
  margin-bottom: 8px;
}

.markdown-body li {
  margin-bottom: 4px;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  font-weight: 600;
  margin-bottom: 8px;
  background: linear-gradient(90deg, var(--purple), var(--cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.markdown-body strong {
  color: var(--cyan);
}

.inline-code {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.2);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  color: var(--cyan);
}

.code-block {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 8px 0;
  overflow-x: auto;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  line-height: 1.5;
}

.code-block code {
  color: #e2e8f0;
}

/* Cursor Blink */
.cursor-blink {
  display: inline-block;
  color: var(--cyan);
  animation: blink 0.8s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Thinking Dots */
.thinking-dots {
  display: inline-flex;
  gap: 4px;
  padding: 4px 0;
}

.thinking-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--purple);
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
  background: var(--cyan);
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
  background: var(--pink);
}

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ============================
   Error Banner
   ============================ */

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 8px 0;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 13px;
}

/* ============================
   Input Area
   ============================ */

.input-container {
  padding: 4px 0;
}

.input-glass {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: var(--glass-shadow);
  transition: border-color 0.3s ease;
}

.input-glass:focus-within {
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: var(--glass-shadow), 0 0 20px rgba(139, 92, 246, 0.1);
}

.chat-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  max-height: 200px;
  font-family: inherit;
}

.chat-textarea::placeholder {
  color: var(--text-muted);
}

/* Send Button */
.send-button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, var(--purple), var(--cyan));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.4);
}

.send-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Stop Button */
.stop-button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  animation: stop-pulse 1.5s ease-in-out infinite;
}

.stop-button:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: scale(1.05);
}

@keyframes stop-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); }
  50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}
```

---

## File: `tailwind.config.ts`

> **หมายเหตุ:** ถ้า Next.js 15 ใช้ TailwindCSS v4 แล้วจะไม่มีไฟล์ `tailwind.config.ts` — config ทำผ่าน `@theme` ใน CSS แทน
> ถ้ายังใช้ v3 ให้สร้างไฟล์นี้:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          purple: "#8b5cf6",
          cyan: "#22d3ee",
          pink: "#f472b6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```
