# Phase 1: Project Initialization

## Step 1.1 — สร้าง Next.js Project

```bash
cd e:\playground\AI-chat-docker
npx -y create-next-app@latest openclaw-chat --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --turbopack
```

> **หมายเหตุ:** ใช้ `--src-dir=false` เพื่อให้ `app/` อยู่ root level ตรงๆ

## Step 1.2 — ติดตั้ง Dependencies เพิ่ม

```bash
cd e:\playground\AI-chat-docker\openclaw-chat

# Three.js + React bindings
npm install three @react-three/fiber @react-three/drei

# Types
npm install -D @types/three

# Markdown rendering (สำหรับ chat messages)
npm install react-markdown remark-gfm

# Syntax highlighting สำหรับ code blocks
npm install react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

## Step 1.3 — อัปเดต `next.config.ts`

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile three.js packages for compatibility
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
};

export default nextConfig;
```

## Step 1.4 — อัปเดต `tsconfig.json` paths

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```
