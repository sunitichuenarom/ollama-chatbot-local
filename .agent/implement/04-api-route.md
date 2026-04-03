# Phase 4: API Route (Server Proxy)

## File: `app/api/chat/route.ts`

```typescript
/**
 * API Route — Proxy to OpenClaw Gateway
 *
 * ทำหน้าที่:
 * 1. รับ messages array จาก client (ที่ผ่าน sliding window แล้ว)
 * 2. Forward ไปยัง OpenClaw ด้วย auth token
 * 3. Stream response กลับมาให้ client
 */

import { NextRequest, NextResponse } from "next/server";

const OPENCLAW_API_URL =
  process.env.OPENCLAW_API_URL || "http://localhost:1312/v1/chat/completions";
const OPENCLAW_AUTH_TOKEN = process.env.OPENCLAW_AUTH_TOKEN || "";
const OPENCLAW_MODEL = process.env.OPENCLAW_MODEL || "qwen3.5:9b";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Forward to OpenClaw with streaming enabled
    const response = await fetch(OPENCLAW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENCLAW_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        model: OPENCLAW_MODEL,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenClaw API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `OpenClaw returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    // Stream the response back to client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === "data: [DONE]") continue;

              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    // Send content chunk to client
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // Skip malformed JSON chunks
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream reading error:", error);
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Request/Response Format

### Client → API Route

```json
POST /api/chat
{
  "messages": [
    { "role": "system", "content": "You are OpenClaw AI..." },
    { "role": "user", "content": "สวัสดี" },
    { "role": "assistant", "content": "สวัสดีครับ! มีอะไรให้ช่วยไหม?" },
    { "role": "user", "content": "ช่วยเขียนโค้ด Python ให้หน่อย" }
  ]
}
```

### API Route → Client (SSE Stream)

```
data: {"content":"ได้"}

data: {"content":"เลย"}

data: {"content":"ครับ"}

data: {"content":"! นี่"}

data: {"content":"คือ"}

data: [DONE]
```
