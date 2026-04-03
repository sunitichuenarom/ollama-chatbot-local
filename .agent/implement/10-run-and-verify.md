# Phase 10: Run & Verify

## Quick Start

```bash
# 1. ย้ายไปโฟลเดอร์โปรเจกต์
cd e:\playground\AI-chat-docker\openclaw-chat

# 2. ติดตั้ง dependencies (ถ้ายังไม่ได้)
npm install

# 3. รัน dev server
npm run dev
```

เปิด browser ไปที่ **http://localhost:3000**

---

## Pre-flight Checklist

| # | ตรวจสอบ | คำสั่ง |
|---|---------|--------|
| 1 | Docker containers รัน (Ollama + OpenClaw) | `docker ps` |
| 2 | Ollama model พร้อม | `curl http://localhost:11434/api/tags` |
| 3 | OpenClaw gateway ตอบ | `curl http://localhost:1312/health` |
| 4 | `.env.local` ถูกต้อง | ตรวจ token + URL |
| 5 | `npm run build` สำเร็จ | ไม่มี TypeScript errors |

---

## ทดสอบ Sliding Window

### Test 1: Normal conversation
1. พิมพ์ "สวัสดี" → ต้องได้ response stream กลับมา
2. ดู console → ไม่มี "Dropped" messages

### Test 2: Long conversation
1. ส่งข้อความยาวๆ 20+ รอบ
2. ดู console → เริ่มเห็น `[Context Manager] Dropped X old messages`
3. UI ยังทำงานปกติ — ข้อความใหม่ไม่หาย
4. Token bar ใน Header ขึ้นสีส้ม/แดง เมื่อใกล้เต็ม

### Test 3: Large single message
1. paste ข้อความยาวมาก (>10,000 characters)
2. ต้องถูก truncate อัตโนมัติ ก่อนส่ง API

### Test 4: Stop streaming
1. ส่งข้อความ → กดปุ่ม Stop ■
2. Streaming ต้องหยุดทันที
3. ข้อความที่ได้มาแล้วยังอยู่

### Test 5: Clear chat
1. กดปุ่ม 🗑️ → ข้อความทั้งหมดหาย
2. System prompt ยังอยู่ใน state (ไม่แสดงใน UI)
3. Token bar กลับเป็น 0%

---

## ทดสอบ Three.js

### Visual Check
- ✅ อนุภาคเรืองแสงลอยไปมา
- ✅ สี 3 สี (purple, cyan, pink) ผสมกัน
- ✅ Nebula glow หมุนช้าๆ ตรงกลาง

### Interaction Check
- ✅ เลื่อน mouse → อนุภาคกระจายออก
- ✅ ไม่กิน CPU/GPU มากเกินไป

---

## Troubleshooting

| ปัญหา | สาเหตุ | แก้ไข |
|--------|--------|-------|
| `ECONNREFUSED localhost:1312` | OpenClaw ไม่รัน | `docker-compose up -d openclaw` |
| `401 Unauthorized` | Token ไม่ตรง | ตรวจ `.env.local` + `openclaw.json` |
| `model not found` | Ollama ยังไม่มี model | `docker exec ollama ollama pull qwen3.5:9b` |
| Three.js ไม่แสดง | WebGL ไม่ support | ตรวจ GPU driver, ลอง Chrome |
| Token bar แดง | Context ใกล้เต็ม | ปกติ — sliding window จะตัดอัตโนมัติ |
| Stream ไม่ทำงาน | API format ไม่ตรง | ตรวจ response format จาก OpenClaw |

---

## Build for Production

```bash
npm run build
npm start
```

หรือรัน Next.js เป็น Docker container:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Summary of All Files

| File | Lines | Description |
|------|-------|-------------|
| `lib/token-counter.ts` | ~35 | Token estimation utility |
| `lib/context-manager.ts` | ~110 | Sliding window logic |
| `app/api/chat/route.ts` | ~95 | Server proxy to OpenClaw |
| `hooks/useOpenClaw.ts` | ~150 | Main chat hook |
| `components/ThreeBackground.tsx` | ~150 | Three.js particles |
| `components/Header.tsx` | ~75 | Header with token bar |
| `components/MessageBubble.tsx` | ~80 | Message rendering |
| `components/MessageInput.tsx` | ~85 | Input textarea |
| `components/ChatWindow.tsx` | ~80 | Chat container |
| `app/layout.tsx` | ~25 | Root layout |
| `app/page.tsx` | ~35 | Main page |
| `app/globals.css` | ~350 | All styles |
| `.env.local` | ~10 | Configuration |
| **Total** | **~1,280** | |
