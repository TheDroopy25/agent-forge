# AgentForge Frontend — Build Complete

## What Was Built

A full-screen, NVIDIA-inspired visual AI agent builder web app built with Next.js 14 (App Router).

### Stack
- **Next.js 16** (App Router) + TypeScript
- **@xyflow/react** — interactive canvas with custom nodes and animated edges
- **Framer Motion** — node hover animations, build sequence animations, hub pulse ring
- **Zustand** — global state for all 11 section configs + completion tracking
- **react-syntax-highlighter** — code output in vscDarkPlus theme
- **shadcn/ui** — Sheet drawers, Slider, Switch, Badge, Tabs, Progress, Separator, Sonner toasts
- **Tailwind CSS** — all styling

### Design
- Dark theme: `#0a0a0f` background, `#12121a` cards, `#1e2d3d` borders
- NVIDIA green accent: `#76b900`
- Cyan accent: `#00d4ff`
- Inter font
- Premium NVIDIA product aesthetic

---

## How to Run

```bash
cd /home/brentnewsom25/.openclaw/workspace/tools/agent-forge/frontend
npm run dev
```

Opens at: http://localhost:3000

---

## File Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with Inter font + Toaster
│   ├── page.tsx            # Main page: header + canvas + bottom bar + build modal
│   └── globals.css         # Dark theme CSS vars + React Flow overrides
├── components/
│   ├── AgentCanvas.tsx     # React Flow canvas with 11 section nodes + hub
│   ├── BottomBar.tsx       # Fixed bottom bar: progress + BUILD button
│   ├── BuildModal.tsx      # Animated build sequence + 4 code output tabs
│   ├── nodes/
│   │   ├── HubNode.tsx     # Center hub node with pulse animation
│   │   └── SectionNode.tsx # Section nodes with status dots + glow
│   └── drawers/
│       ├── IdentityDrawer.tsx       # Name, avatar, purpose, 4 personality sliders
│       ├── LLMDrawer.tsx            # Provider cards, model, temperature, fallback chain
│       ├── VoiceDrawer.tsx          # TTS provider, voice, speed, preview
│       ├── MemoryDrawer.tsx         # 5 memory types with toggle + config
│       ├── DataDrawer.tsx           # File dropzone, URLs, API connections
│       ├── ToolsDrawer.tsx          # 10 tool toggles, custom MCP URL
│       ├── SkillsDrawer.tsx         # 12 skill toggle cards
│       ├── SubAgentsDrawer.tsx      # Add agents, routing mode, concurrent limit
│       ├── ChannelsDrawer.tsx       # Discord/Telegram/REST/SMS/CLI channels
│       ├── GuardrailsDrawer.tsx     # Never-do tags, cost/token limits, hard stop
│       └── ObservabilityDrawer.tsx  # Log level, heartbeat, tracing, alerts
├── store/
│   └── agentStore.ts       # Zustand store: all 11 sections + sectionComplete map
└── lib/
    └── generators.ts       # 4 code generators: YAML, SOUL.md, AGENTS.md, Python
```

---

## Features

### Interactive Canvas
- Hub node in center with animated green pulse ring
- 11 section nodes arranged in a circle at radius 320px
- Status dots on each node: gray (not started), yellow (in progress), green (complete)
- Edges glow green when section is complete
- Click any node to open its configuration drawer

### All 11 Configuration Sections
Each opens as a right-side Sheet drawer and saves state to Zustand in real-time:

1. **Identity** — name, avatar emoji picker (20 options), purpose, 4 personality sliders
2. **LLM/Brain** — 6 provider cards (OpenAI/Anthropic/Google/Mistral/Ollama/NVIDIA), model dropdown, temperature, 3-level fallback chain
3. **Voice** — master toggle, 4 TTS providers, voice picker, speed, style, fake preview
4. **Memory** — 5 toggle types: short-term (N turns), long-term (vector store), episodic, working, external DB
5. **Data/Context** — file dropzone, URL indexer, API key-value pairs, structured toggle
6. **Tools** — 10 tool toggles with custom MCP URL input
7. **Skills** — 12 skill toggle cards in 3-column grid
8. **Sub-Agents** — add/remove agents, routing mode, max concurrent, coordinator/worker role
9. **Channels** — Discord/Telegram/WhatsApp/REST/SMS/CLI with per-channel config, primary channel selection
10. **Guardrails** — never-do + always-ask tag inputs, cost/token limits, hard stop file, max tool calls
11. **Observability** — log level segmented control, heartbeat, trace path, Discord alerts, daily summary, context compression

### Build Modal
- Animated 5-step build sequence (Framer Motion, 0.5s per step)
- 4 code output tabs with syntax highlighting:
  - OpenClaw YAML — real agent config from state
  - SOUL.md — personality + values document
  - AGENTS.md — workspace instructions
  - Python — LangGraph agent skeleton
- Copy to clipboard + Download buttons per tab
- "Deploy to OpenClaw" button with success toast

### Bottom Bar
- Progress: "X of 11 sections configured" + 11-segment visual bar
- BUILD AGENT button: disabled (gray) until Identity + LLM complete, then glowing green with pulse

---

## TODOs / Future Work

- [ ] "New Agent" and "Load Saved" buttons (currently stubs)
- [ ] Persist agent configs to local storage or backend
- [ ] WhatsApp channel integration (marked "Coming Soon")
- [ ] Real voice preview playback (currently fakes 2s delay)
- [ ] Real file upload processing for Data/Context section
- [ ] Deploy to OpenClaw actual integration (currently shows toast only)
- [ ] Multi-agent canvas support (view sub-agents as nested nodes)
- [ ] Import/export agent configs as JSON
- [ ] Agent versioning / history
