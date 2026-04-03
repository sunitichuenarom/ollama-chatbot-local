# Phase 3: Context Manager (Sliding Window)

หัวใจของโปรเจกต์ — ป้องกัน context overflow 32K tokens

---

## File: `lib/token-counter.ts`

```typescript
/**
 * Token Counter — Approximate token estimation
 *
 * ใช้ heuristic แทน tiktoken เพื่อความเร็ว:
 * - English/Code: ~4 characters per token
 * - Thai/CJK: ~1.5 characters per token
 * - Mixed: weighted average
 */

// Regex to detect Thai/CJK characters
const CJK_THAI_REGEX = /[\u0E00-\u0E7F\u3000-\u9FFF\uAC00-\uD7AF]/g;

export function estimateTokens(text: string): number {
  if (!text) return 0;

  const cjkThaiMatches = text.match(CJK_THAI_REGEX);
  const cjkThaiCharCount = cjkThaiMatches ? cjkThaiMatches.length : 0;
  const otherCharCount = text.length - cjkThaiCharCount;

  // Thai/CJK: ~1.5 chars per token
  // English/Code: ~4 chars per token
  const cjkTokens = cjkThaiCharCount / 1.5;
  const otherTokens = otherCharCount / 4;

  // Add overhead for message formatting (role, separators, etc.)
  return Math.ceil(cjkTokens + otherTokens);
}

export function estimateMessageTokens(message: { role: string; content: string }): number {
  // Each message has ~4 tokens overhead (role, formatting)
  const overhead = 4;
  return estimateTokens(message.content) + overhead;
}

export function estimateAllTokens(messages: { role: string; content: string }[]): number {
  // Base overhead for the request format
  const baseOverhead = 3;
  return messages.reduce((sum, msg) => sum + estimateMessageTokens(msg), baseOverhead);
}
```

---

## File: `lib/context-manager.ts`

```typescript
/**
 * Context Manager — Sliding Window Strategy
 *
 * จัดการ context ให้อยู่ใน budget ก่อนส่งไป OpenClaw API
 *
 * Strategy:
 * 1. System prompt จะถูกเก็บเสมอ (ไม่ถูกตัด)
 * 2. ตัดข้อความเก่าสุดออกทีละ message (FIFO)
 * 3. เก็บข้อความล่าสุดให้มากที่สุดเท่าที่ budget อนุญาต
 * 4. ถ้า single message ใหญ่เกินไป → truncate เนื้อหา
 */

import { estimateMessageTokens, estimateAllTokens } from "./token-counter";

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ContextResult {
  messages: { role: string; content: string }[];
  totalTokens: number;
  droppedCount: number;
  originalCount: number;
}

const DEFAULT_MAX_INPUT_TOKENS = 20000;
const SINGLE_MESSAGE_MAX_TOKENS = 8000; // ถ้า message เดียวเกิน 8K → truncate

/**
 * Truncate a single message content to fit within token budget
 */
function truncateContent(content: string, maxTokens: number): string {
  // Rough estimate: if 1 token ≈ 3 chars (average), cut by char count
  const maxChars = maxTokens * 3;
  if (content.length <= maxChars) return content;
  return content.slice(0, maxChars) + "\n\n... [ข้อความถูกตัดทอนเนื่องจาก context limit]";
}

/**
 * Apply sliding window to messages array
 * Returns trimmed messages array ready to send to API
 */
export function applySlidingWindow(
  messages: ChatMessage[],
  maxInputTokens: number = DEFAULT_MAX_INPUT_TOKENS
): ContextResult {
  if (messages.length === 0) {
    return { messages: [], totalTokens: 0, droppedCount: 0, originalCount: 0 };
  }

  // 1. Separate system prompt from conversation messages
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  // 2. Calculate system prompt tokens (always reserved)
  const systemPayload = systemMessages.map((m) => ({ role: m.role, content: m.content }));
  const systemTokens = estimateAllTokens(systemPayload);

  // 3. Available budget for conversation
  const conversationBudget = maxInputTokens - systemTokens;

  if (conversationBudget <= 0) {
    // System prompt alone exceeds budget — unlikely but handle gracefully
    return {
      messages: systemPayload,
      totalTokens: systemTokens,
      droppedCount: conversationMessages.length,
      originalCount: messages.length,
    };
  }

  // 4. Build conversation from newest to oldest (reverse)
  const selected: { role: string; content: string }[] = [];
  let usedTokens = 0;
  let droppedCount = 0;

  // Iterate from newest message backwards
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const msg = conversationMessages[i];
    let content = msg.content;

    // Truncate individual message if too long
    const msgTokens = estimateMessageTokens({ role: msg.role, content });
    if (msgTokens > SINGLE_MESSAGE_MAX_TOKENS) {
      content = truncateContent(content, SINGLE_MESSAGE_MAX_TOKENS);
    }

    const finalTokens = estimateMessageTokens({ role: msg.role, content });

    if (usedTokens + finalTokens <= conversationBudget) {
      selected.unshift({ role: msg.role, content });
      usedTokens += finalTokens;
    } else {
      // Budget exceeded — drop this and all older messages
      droppedCount = i + 1;
      break;
    }
  }

  // 5. Combine: system prompt + selected conversation
  const finalMessages = [...systemPayload, ...selected];
  const totalTokens = systemTokens + usedTokens;

  return {
    messages: finalMessages,
    totalTokens,
    droppedCount,
    originalCount: messages.length,
  };
}

/**
 * Calculate current token usage info for UI display
 */
export function getTokenUsage(messages: ChatMessage[], maxInputTokens: number = DEFAULT_MAX_INPUT_TOKENS) {
  const payload = messages.map((m) => ({ role: m.role, content: m.content }));
  const currentTokens = estimateAllTokens(payload);
  const percentage = Math.min((currentTokens / maxInputTokens) * 100, 100);

  return {
    current: currentTokens,
    max: maxInputTokens,
    percentage,
    isWarning: percentage > 70,
    isCritical: percentage > 90,
  };
}
```

---

## วิธีใช้ (Usage Example)

```typescript
import { applySlidingWindow, ChatMessage } from "@/lib/context-manager";

// messages = ข้อความทั้งหมดใน state
const allMessages: ChatMessage[] = [...];

// ก่อนส่ง API — apply sliding window
const result = applySlidingWindow(allMessages, 20000);

// result.messages → ส่งไป API (ตัดแล้ว)
// result.totalTokens → จำนวน tokens ที่จะส่ง
// result.droppedCount → จำนวนข้อความที่ถูกตัด
// result.originalCount → จำนวนข้อความทั้งหมด

console.log(`Sending ${result.messages.length} messages (${result.totalTokens} tokens)`);
console.log(`Dropped ${result.droppedCount} old messages`);
```

## Flow Diagram

```
User sends message
        │
        ▼
┌───────────────────┐
│ Add to messages[] │
└────────┬──────────┘
         │
         ▼
┌───────────────────────┐
│  applySlidingWindow() │
│                       │
│  1. Keep system prompt│
│  2. Iterate newest→   │
│     oldest            │
│  3. Sum tokens        │
│  4. Stop when budget  │
│     exceeded          │
│  5. Drop older msgs   │
└────────┬──────────────┘
         │
         ▼
   result.messages
   (trimmed array)
         │
         ▼
┌───────────────────┐
│  POST /api/chat   │
│  body: { messages }│
└───────────────────┘
```
