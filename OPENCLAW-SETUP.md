# OpenClaw Docker Setup Guide

OpenClaw AI Agent + Ollama + Open WebUI บน Docker

## สถาปัตยกรรม

```
┌─────────────────────────────────────────────┐
│  Docker Compose Stack                       │
│                                             │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │  Ollama   │  │ Open WebUI│  │ OpenClaw │  │
│  │  :11434   │  │   :1311   │  │  :1312   │  │
│  │  (LLM)    │  │  (Chat)   │  │  (Agent) │  │
│  └──────────┘  └───────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

| Service | URL | คำอธิบาย |
|---------|-----|----------|
| Ollama | `http://localhost:11434` | LLM Backend (GPU) |
| Open WebUI | `http://localhost:1311` | ChatGPT-like UI |
| OpenClaw | `http://localhost:1312` | AI Coding Agent |

---

## ขั้นตอนการ Setup ตั้งแต่เริ่มต้น

### 1. สร้าง Config สำหรับ OpenClaw

สร้างโฟลเดอร์ `openclaw-config/` และไฟล์ `openclaw.json`:

```bash
mkdir openclaw-config
```

สร้างไฟล์ `openclaw-config/openclaw.json`:

```json
{
  "gateway": {
    "mode": "local",
    "controlUi": {
      "dangerouslyAllowHostHeaderOriginFallback": true,
      "allowInsecureAuth": true
    }
  }
}
```

> **หมายเหตุ:** OpenClaw จะ generate `auth.token` เองอัตโนมัติตอน start ครั้งแรก

---

### 2. สร้าง `docker-compose.yml`

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: always
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: always
    ports:
      - "1311:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    volumes:
      - open_webui_data:/app/backend/data
    depends_on:
      - ollama

  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw
    restart: always
    command: ["node", "dist/index.js", "gateway", "--bind", "lan", "--port", "18789", "--allow-unconfigured"]
    environment:
      - LLM_PROVIDER=ollama
      - LLM_OLLAMA_BASE_URL=http://ollama:11434
      - LLM_MODEL=qwen-coder
    ports:
      - "1312:18789"
    volumes:
      - ./openclaw-config:/home/node/.openclaw
    depends_on:
      - ollama

volumes:
  ollama_data:
  open_webui_data:
```

> **⚠️ สิ่งสำคัญเกี่ยวกับ OpenClaw config:**
>
> | การตั้งค่า | ทำไมต้องมี |
> |-----------|-----------|
> | `command: [..., "--bind", "lan", ...]` | บังคับ gateway bind ที่ LAN interface (ไม่ใช่ loopback) เพื่อให้ Docker port forwarding ทำงานได้ |
> | `"--allow-unconfigured"` | ให้ start ได้โดยไม่ต้องรัน `openclaw setup` ก่อน |
> | `"--port", "18789"` | port ภายใน container (default ของ OpenClaw) |
> | `ports: "1312:18789"` | map host port 1312 → container port 18789 |
> | `volumes: ./openclaw-config:/home/node/.openclaw` | mount config directory เพื่อให้ OpenClaw อ่าน/เขียน config ได้ |
> | `dangerouslyAllowHostHeaderOriginFallback` | อนุญาต origin check ผ่าน Host header (จำเป็นสำหรับ non-loopback) |
> | `allowInsecureAuth` | อนุญาต token-only auth ผ่าน HTTP |

---

### 3. Start ทุก Service

```bash
docker compose up -d
```

---

### 4. Pull Model ใน Ollama (ถ้ายังไม่มี)

```bash
docker exec ollama ollama pull qwen-coder
```

---

### 5. เชื่อมต่อ OpenClaw Web UI

#### 5.1 ดู Auth Token

```bash
docker exec openclaw openclaw dashboard --no-open
```

จะได้ URL แบบ:
```
Dashboard URL: http://127.0.0.1:18789/#token=<YOUR_TOKEN>
```

จด token หลัง `#token=` ไว้

หรือดูจาก config โดยตรง:
```bash
docker exec openclaw cat /home/node/.openclaw/openclaw.json
```

ดูค่า `gateway.auth.token`

#### 5.2 เปิด Web UI

เปิด browser ไปที่: **http://localhost:1312/**

กรอก:
- **WebSocket URL:** `ws://localhost:1312`
- **Gateway Token:** `<YOUR_TOKEN>` จากขั้นตอน 5.1
- กด **Connect**

#### 5.3 Approve Device Pairing

ครั้งแรกจะขึ้น **"pairing required"** — ต้อง approve device:

```bash
# ดู pending devices
docker exec openclaw openclaw devices list

# Approve (แทน <REQUEST_ID> ด้วย ID ที่เห็น)
docker exec openclaw openclaw devices approve <REQUEST_ID>
```

กลับไปที่ browser กด **Connect** อีกครั้ง → เข้าใช้งานได้! 🎉

---

## 📖 เอกสารเพิ่มเติม

- [Ollama Provider Guide](file:///.agent/ollama_guide.md) — รายละเอียดการตั้งค่า Model, Reasoning และการ Troubleshooting สำหรับ Ollama

---

## Troubleshooting

| ปัญหา | สาเหตุ | แก้ไข |
|-------|--------|------|
| `ERR_SOCKET_NOT_CONNECTED` | Port mapping ผิด หรือ gateway bind ที่ loopback | ตรวจสอบ `command` มี `--bind lan` และ ports เป็น `1312:18789` |
| `Missing config` | ไม่มี `--allow-unconfigured` flag | เพิ่ม `--allow-unconfigured` ใน command |
| `non-loopback Control UI requires...` | ขาด config `dangerouslyAllowHostHeaderOriginFallback` | เพิ่มใน `openclaw.json` |
| `pairing required` | Device ยังไม่ได้ approve | รัน `openclaw devices list` แล้ว `approve` |
| `token_missing` | ไม่ได้ใส่ token ใน UI | ดู token จาก `openclaw dashboard --no-open` |
| Gateway ยังฟังที่ `127.0.0.1` | ไม่ได้ override command | ต้องเพิ่ม `command` ใน docker-compose.yml |

---

## โครงสร้างไฟล์

```
AI-chat-docker/
├── docker-compose.yml
├── openclaw-config/
│   └── openclaw.json          ← OpenClaw gateway config
├── ollama_data/               ← Ollama model data (Docker volume)
└── webui_data/                ← Open WebUI data (Docker volume)
```
