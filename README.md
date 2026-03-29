# ⚡ AgentForge

**Visual Agent Builder** — Design AI agents by clicking through a canvas, not writing config files.

Built by [Batch](https://github.com/brentnewsom25) (an AI assistant) as a birthday project. Inspired by the NVIDIA NemoClaw architecture.

![AgentForge Screenshot](./docs/screenshot.png)

---

## What It Does

AgentForge gives you an interactive canvas with 11 configuration sections. Click a node, fill it out, watch the status dot turn green. When you're ready, hit **BUILD AGENT** and get a working agent config in 4 formats — OpenClaw YAML, SOUL.md, AGENTS.md, and Python/LangGraph.

### The 11 Sections

| Section | What You Configure |
|---|---|
| 🧠 Identity | Name, avatar, purpose, personality sliders (verbosity, tone, humor, assertiveness) |
| 🤖 LLM / Brain | Provider (OpenAI/Anthropic/Google/Mistral/Ollama/NVIDIA NIM), model, temperature, fallback chain |
| 🎙️ Voice | TTS provider (ElevenLabs/Azure/OpenAI/Kokoro), voice picker, speed, preview |
| 💾 Memory | Short-term, long-term (vector), episodic (daily files), working memory, external DB |
| 📁 Data / Context | File upload, URL indexer, API connections |
| 🔧 Tools | Web search, code exec, browser control, file system, terminal, and more |
| ⚡ Skills | Pre-built skill packs (Discord, GitHub, Google Workspace, etc.) |
| 👥 Sub-Agents | Child agents, routing mode, coordinator vs worker role |
| 📡 Channels | Discord, Telegram, REST API, SMS/Twilio, CLI |
| 🛡️ Guardrails | Never-do list, cost limits, token budget, hard stop file |
| 📊 Observability | Log level, heartbeat interval, Discord alerts, trace output |

### Build Output

Once configured, AgentForge generates:
- **OpenClaw YAML** — drop-in agent config for [OpenClaw](https://openclaw.ai)
- **SOUL.md** — agent personality and values document
- **AGENTS.md** — workspace instructions for the agent
- **Python (LangGraph)** — skeleton agent you can run standalone

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install & Run

```bash
git clone https://github.com/brentnewsom25/agent-forge.git
cd agent-forge/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **React Flow** (`@xyflow/react`) — interactive canvas
- **Framer Motion** — animations
- **Zustand** — state management
- **shadcn/ui** — UI components
- **Tailwind CSS** — styling
- **react-syntax-highlighter** — code output

---

## Design

NVIDIA-inspired dark theme:
- Background: `#0a0a0f`
- Cards: `#12121a`
- Accent: `#76b900` (NVIDIA green)
- Cyan: `#00d4ff`

---

## Roadmap

- [ ] Save/load agent configs (local storage + import/export JSON)
- [ ] Real voice preview (ElevenLabs API)
- [ ] WhatsApp channel support
- [ ] Multi-agent canvas (sub-agents as nested nodes)
- [ ] Real file upload processing
- [ ] One-click deploy to OpenClaw
- [ ] Agent versioning / history

---

## License

MIT — build whatever you want with it.
