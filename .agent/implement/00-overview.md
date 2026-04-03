# OpenClaw AI Chat — Implementation Guide

## สารบัญ (File Index)

| ไฟล์ | เนื้อหา |
|------|---------|
| `00-overview.md` | ภาพรวม, Architecture, สารบัญ |
| `01-project-init.md` | สร้างโปรเจกต์ Next.js + Dependencies |
| `02-env-config.md` | Environment variables & config |
| `03-context-manager.md` | Sliding Window Token Management |
| `04-api-route.md` | Next.js API Route (proxy to OpenClaw) |
| `05-use-openclaw-hook.md` | Custom React Hook |
| `06-three-background.md` | Three.js Particle Background |
| `07-chat-ui.md` | Chat UI Components (Header, Messages, Input) |
| `08-main-page.md` | Main page assembly |
| `09-styles.md` | Global styles & TailwindCSS config |
| `10-run-and-verify.md` | วิธีรัน & ทดสอบ |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js Frontend                       │
│                                                          │
│  ┌─────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │ Chat UI │──▶│ useOpenClaw  │──▶│ Context Manager  │  │
│  │ + Three │   │   (Hook)     │   │ (Sliding Window) │  │
│  └─────────┘   └──────┬───────┘   └──────────────────┘  │
│                        │                                  │
│                 ┌──────▼───────┐                          │
│                 │ /api/chat    │  (Server-side proxy)     │
│                 │ route.ts     │                          │
│                 └──────┬───────┘                          │
└────────────────────────┼─────────────────────────────────┘
                         │ POST (streaming SSE)
              ┌──────────▼──────────┐
              │   OpenClaw Gateway  │  localhost:1312
              │   (Docker)          │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │   Ollama + Qwen 3.5 │  localhost:11434
              │   9B (GPU)          │
              └─────────────────────┘
```

## Critical Constraints

1. **Context Window: 32,768 tokens** — VRAM limit ของ RTX 4070 Super 12GB
2. **Input Budget: ~20,000 tokens** — เหลือ ~12K สำหรับ response
3. **Security:** ไม่ expose token ฝั่ง client, ใช้ API route เป็น proxy
4. **Performance:** Three.js ต้อง dispose resources เมื่อ unmount

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **3D:** Three.js via `@react-three/fiber` + `@react-three/drei`
- **Font:** Inter (Google Fonts)
- **API:** OpenAI-compatible REST API with SSE streaming

## โครงสร้างโปรเจกต์ (Target)

```
openclaw-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Server proxy to OpenClaw
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main chat page
├── components/
│   ├── ChatWindow.tsx            # Chat container
│   ├── Header.tsx                # Top bar
│   ├── MessageBubble.tsx         # Message bubble component
│   ├── MessageInput.tsx          # Input textarea
│   └── ThreeBackground.tsx       # Three.js particle background
├── hooks/
│   └── useOpenClaw.ts            # Main chat hook
├── lib/
│   ├── context-manager.ts        # Sliding window logic
│   └── token-counter.ts          # Token estimation
├── .env.local                    # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
