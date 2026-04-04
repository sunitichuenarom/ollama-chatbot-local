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
