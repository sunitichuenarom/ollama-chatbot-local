# OpenClaw + Next.js Integration Guidelines

## System Architecture
- **LLM:** Local Qwen 3.5 9B via Ollama (Max Context: 32768 tokens due to RTX 4070 Super 12GB VRAM limit).
- **Backend/Gateway:** OpenClaw running locally. Connect via WebSocket or API.
- **Frontend:** Next.js (App Router), React, TailwindCSS.

## Critical Constraints & Requirements
1. **Context Window Management (Crucial):** - The LLM has a strict 32K context limit.
   - The Next.js frontend MUST implement a "Sliding Window" or "Message Truncation" logic.
   - Before sending the chat history array to OpenClaw, ensure the total payload does not exceed ~20,000 tokens (leave room for output). Drop older messages (keep the system prompt and the latest N messages).
2. **Security:** Do not expose OpenClaw ports to the public. Run on localhost.
3. **UI/UX:** Create a clean, cute chat interface. Implement streaming text effects (typewriter effect) to handle chunks from the WebSocket/API.

## Implementation Steps for Agent
1. Initialize a Next.js project with TailwindCSS.
2. Create a custom React Hook (`useOpenClaw.ts`) to manage WebSocket/API connections, message state, and the auto-truncation logic.
3. Build the Chat UI components (MessageList, MessageInput, Header).
4. Integrate the hook with the UI. Ensure streaming responses render correctly.