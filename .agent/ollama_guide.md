# Ollama Provider Guide (OpenClaw)

คู่มือการตั้งค่าและใช้งาน Ollama กับ OpenClaw ภายใน Docker environment อ้างอิงจาก [OpenClaw Official Documentation](https://docs.openclaw.ai/providers/ollama#ollama)

## 🚀 Quick Start (Docker)

1. **Pull Model**: หากยังไม่มี model ใน Ollama ให้รันคำสั่ง:
   ```bash
   docker exec ollama ollama pull qwen-coder
   ```
   *(หรือ model อื่นๆ เช่น llama3.3, deepseek-r1)*

2. **Verify Connection**: ตรวจสอบว่า OpenClaw เชื่อมต่อกับ Ollama ได้โดยดูที่ Log ของ container:
   ```bash
   docker logs openclaw
   ```

---

## 🔍 Model Discovery (อัตโนมัติ)

OpenClaw มีฟีเจอร์ **Implicit Model Discovery** สำหรับ Ollama:
- เมื่อตั้งค่า `OLLAMA_API_KEY` (ในกรณีนี้คือ `ollama-local`) OpenClaw จะพยายามดึงรายการ model จาก `/api/tags` โดยอัตโนมัติ
- รองรับการตรวจจับ **Reasoning models** (ที่มีชื่ออย่าง r1, reasoning, think)
- ตั้งค่า `maxTokens` และ `contextWindow` เบื้องต้นโดยอัตโนมัติ
- ค่าใช้จ่าย (Costs) ทั้งหมดจะถูกตั้งเป็น 0

---

## ⚙️ การตั้งค่าใน `openclaw.json`

ไฟล์การตั้งค่าหลักอยู่ที่ `openclaw-config/openclaw.json` (หรือภายใน container ที่ `/home/node/.openclaw/openclaw.json`)

### Basic Setup (Explicit)
หากต้องการระบุ model ให้แน่นอน:

```json
{
  "models": {
    "providers": {
      "ollama": {
        "module": "ollama",
        "config": {
          "baseUrl": "http://ollama:11434",
          "apiKey": "ollama-local"
        },
        "models": [
          {
            "id": "qwen-coder",
            "name": "Qwen Coder",
            "reasoning": false,
            "contextWindow": 8192,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

---

## 🧠 ฟีเจอร์ขั้นสูง (Advanced)

### Reasoning Models
สำหรับ Model อย่าง **DeepSeek-R1**:
- OpenClaw จะตรวจจับบล็อก `<thought>` และแสดงผลแยกกันโดยอัตโนมัติ
- การตั้งค่า: เพิ่ม `"reasoning": true` ใน model definition

### Context Windows
- คุณสามารถปรับแต่ง `contextWindow` ใน `openclaw.json` เพื่อให้เหมาะกับสเปกเครื่อง
- OpenClaw จะพยายามอ่านค่า `num_ctx` จาก Ollama แต่การระบุใน config จะแน่นอนกว่า

### Cloud Models (Local + Cloud)
Ollama (รุ่นใหม่) รองรับการใช้งาน Cloud models ผ่าน local instance:
- ต้องรัน `ollama signin` (ใน host หรือ container ที่มีสิทธิ์)
- สามารถใช้ model เช่น `kimi-k2.5:cloud`, `glm-5:cloud` ได้โดยไม่ต้อง pull ลงเครื่อง

---

## 🛠 การแก้ไขปัญหา (Troubleshooting)

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ไข |
|-------|------------------|----------|
| **Ollama not detected** | Network ระหว่าง container ผิดพลาด | เช็คว่า `baseUrl` ใน `openclaw.json` คือ `http://ollama:11434` (ชื่อ container) |
| **No models available** | ยังไม่ได้ pull model | รัน `docker exec ollama ollama list` เพื่อดู model ที่มี |
| **Connection refused** | Ollama service ไม่ทำงาน | รัน `docker restart ollama` |
| **Tool-calling fail** | Model ไม่รองรับ Native tools | ลองสลับไปใช้ `api: "openai-completions"` ใน config (Legacy mode) |

---

## 🔗 อ้างอิง
- [OpenClaw Providers - Ollama](https://docs.openclaw.ai/providers/ollama)
- [Ollama Library (Models list)](https://ollama.com/library)
