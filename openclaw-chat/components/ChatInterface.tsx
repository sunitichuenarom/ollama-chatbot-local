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

export default function ChatInterface() {
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
