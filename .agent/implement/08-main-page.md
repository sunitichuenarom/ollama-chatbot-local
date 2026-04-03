# Phase 8: Main Page & Layout

## File: `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OpenClaw AI — Local Chat",
  description:
    "Chat with OpenClaw AI powered by Qwen 3.5 9B running locally on your machine.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐾</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

---

## File: `app/page.tsx`

```tsx
"use client";

import dynamic from "next/dynamic";
import { useOpenClaw } from "@/hooks/useOpenClaw";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import MessageInput from "@/components/MessageInput";

// Dynamic import Three.js (no SSR)
const ThreeBackground = dynamic(() => import("@/components/ThreeBackground"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a1628]" />
  ),
});

export default function Home() {
  const {
    messages,
    isStreaming,
    error,
    tokenUsage,
    sendMessage,
    clearMessages,
    stopStreaming,
  } = useOpenClaw();

  return (
    <main className="app-container">
      {/* Three.js Particle Background */}
      <ThreeBackground />

      {/* Chat Interface */}
      <div className="chat-layout">
        <Header
          tokenUsage={tokenUsage}
          onClear={clearMessages}
          isStreaming={isStreaming}
        />

        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          error={error}
        />

        <MessageInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </main>
  );
}
```

---

## Key Design Decisions

1. **`dynamic import` สำหรับ ThreeBackground** — Three.js ใช้ WebGL ซึ่งต้องรันบน browser เท่านั้น ใช้ `{ ssr: false }` กัน server-side rendering error
2. **Fallback gradient** — ขณะโหลด Three.js จะแสดง gradient background ก่อน
3. **Layout structure** — ใช้ flexbox column เต็มหน้าจอ:
   ```
   ┌─────────────────────────┐
   │     Header (fixed)      │
   ├─────────────────────────┤
   │                         │
   │     ChatWindow          │
   │     (flex-1, scroll)    │
   │                         │
   ├─────────────────────────┤
   │   MessageInput (fixed)  │
   └─────────────────────────┘
   ```
