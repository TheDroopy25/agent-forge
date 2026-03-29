# AgentForge

Build and deploy AI agents without writing a single line of code.

## What is it?

AgentForge is a visual AI agent builder. Design your agent on an interactive canvas, configure its brain, memory, tools, and channels — then deploy it directly to your computer with one click.

## Two ways to use it

### 🌐 Web (agentforge.vercel.app)
Use the visual builder to design your agent and generate config files. Download them and set up manually.

### 🖥️ Desktop App (recommended)
Download the app for your platform. Everything happens locally — no account needed, no cloud.

| Platform | Download |
|---|---|
| macOS | AgentForge-1.0.0.dmg |
| Windows | AgentForge-Setup-1.0.0.exe |
| Linux | AgentForge-1.0.0.AppImage |

## Development

### Run the web app
```bash
cd frontend
npm install
npm run dev
```

### Run the desktop app (dev mode)
```bash
# Terminal 1: start Next.js
cd frontend && npm run dev

# Terminal 2: start Electron (pointing at localhost:3000)
cd electron && npm install && ELECTRON_IS_DEV=1 node_modules/.bin/electron .
```

### Build desktop installers
```bash
cd frontend && npm run build    # build static export
cd ../electron && npm run build # package with electron-builder
# Output: electron/dist/
```

## Architecture

```
agentforge/
├── frontend/          # Next.js 16 app (React, Zustand, React Flow)
│   ├── app/           # App Router pages
│   ├── components/    # UI components (canvas, drawers, modals, wizards)
│   ├── store/         # Zustand state
│   └── lib/           # Code generators + Electron bridge
└── electron/          # Desktop app wrapper
    ├── main.js        # Electron main process
    ├── preload.js     # Context bridge (window.electronAPI)
    └── ipc-handlers.js # Deploy pipeline, prereq checks, file writing
```

## How deploy works

1. User configures agent on visual canvas
2. Clicks **Deploy to OpenClaw**
3. Electron checks for Node 18+ and OpenClaw — installs if missing
4. Writes agent config files to `~/openclaw-agents/<name>/`
5. Runs `openclaw start` and streams progress back
6. Agent is live 🎉
