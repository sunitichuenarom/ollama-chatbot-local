# Phase 2: Environment Configuration

## `.env.local`

สร้างไฟล์ `openclaw-chat/.env.local`:

```env
# OpenClaw Gateway
OPENCLAW_API_URL=http://localhost:1312/v1/chat/completions
OPENCLAW_AUTH_TOKEN=650df9f5ce310e504cb24038120e7d6fa1ad68763aec7e5a

# Model
OPENCLAW_MODEL=qwen3.5:9b

# Context limits
OPENCLAW_MAX_CONTEXT_TOKENS=32768
OPENCLAW_MAX_INPUT_TOKENS=20000

# System prompt
OPENCLAW_SYSTEM_PROMPT=You are OpenClaw AI, a friendly and helpful assistant running on local hardware. You are powered by Qwen 3.5 9B. Be concise but thorough. You can respond in Thai or English depending on the user's language.
```

## ทำไมต้องใช้ API Route เป็น Proxy?

```
Client (browser)
    │
    │  POST /api/chat  ← ไม่มี token, ปลอดภัย
    │
    ▼
Next.js API Route (server)
    │
    │  POST http://localhost:1312/v1/chat/completions
    │  Authorization: Bearer 650df9f5...  ← token อยู่ฝั่ง server เท่านั้น
    │
    ▼
OpenClaw Gateway
```

**ข้อดี:**
1. Auth token ไม่หลุดไปฝั่ง browser
2. สามารถ add middleware (rate limit, logging) ได้ภายหลัง
3. ไม่ต้อง configure CORS บน OpenClaw
