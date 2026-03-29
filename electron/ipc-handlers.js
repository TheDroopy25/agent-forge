const { shell } = require('electron');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'my-agent';
}

function runCommand(cmd, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: timeoutMs }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout.trim());
    });
  });
}

function registerHandlers(ipcMain, getWindow) {
  // ── check-prereqs ────────────────────────────────────────────────────────────
  ipcMain.handle('check-prereqs', async () => {
    let node = false, nodeVersion = '', openclaw = false, openclawVersion = '';

    try {
      const v = await runCommand('node --version');
      nodeVersion = v;
      const major = parseInt(v.replace('v', '').split('.')[0], 10);
      node = major >= 18;
    } catch (_) {}

    try {
      const v = await runCommand('openclaw --version');
      openclawVersion = v;
      openclaw = true;
    } catch (_) {
      try {
        const v = await runCommand('npx --yes openclaw --version', 30000);
        openclawVersion = v;
        openclaw = true;
      } catch (_) {}
    }

    return { node, nodeVersion, openclaw, openclawVersion };
  });

  // ── install-openclaw ─────────────────────────────────────────────────────────
  ipcMain.handle('install-openclaw', async () => {
    const win = getWindow();
    const send = (msg) => { if (msg.trim()) win?.webContents.send('install-progress', msg.trim()); };

    send('Installing OpenClaw... this takes about 30 seconds');

    return new Promise((resolve, reject) => {
      const proc = spawn('npm', ['install', '-g', 'openclaw'], { shell: true });

      proc.stdout.on('data', (d) => send(d.toString()));
      proc.stderr.on('data', (d) => send(d.toString()));

      proc.on('close', (code) => {
        if (code === 0) {
          send('OpenClaw installed successfully! ✅');
          resolve({ success: true });
        } else {
          const msg = 'Installation failed. Please try running: npm install -g openclaw in a terminal.';
          send(msg);
          reject(new Error(msg));
        }
      });

      proc.on('error', (err) => {
        const msg = `Could not run npm: ${err.message}. Make sure Node.js is installed.`;
        send(msg);
        reject(new Error(msg));
      });
    });
  });

  // ── deploy-agent ─────────────────────────────────────────────────────────────
  ipcMain.handle('deploy-agent', async (_event, config) => {
    const win = getWindow();
    const send = (msg) => win?.webContents.send('deploy-progress', msg);

    const { name, yaml, soul, agents, apiKey, discordToken, authType, oauthToken, refreshToken, tokenExpires, llmProvider } = config;
    const safeName = sanitizeName(name || 'my-agent');
    const workspaceDir = path.join(os.homedir(), 'openclaw-agents', safeName);
    const memoryDir = path.join(workspaceDir, 'memory');

    try {
      // Step 1 — Create workspace
      send('Creating your agent workspace... 📁');
      fs.mkdirSync(workspaceDir, { recursive: true });
      fs.mkdirSync(memoryDir, { recursive: true });

      // Step 2 — Write personality files
      send('Writing agent personality... 🧠');
      if (soul)   fs.writeFileSync(path.join(workspaceDir, 'SOUL.md'),   soul,       'utf8');
      if (agents) fs.writeFileSync(path.join(workspaceDir, 'AGENTS.md'), agents,     'utf8');

      // Step 3 — Write config
      send('Writing agent config... ⚙️');
      if (yaml) fs.writeFileSync(path.join(workspaceDir, 'agent.yaml'), yaml, 'utf8');

      // Step 4 — Credentials
      send('Setting up credentials... 🔑');

      // 4a — OAuth / setup-token → write auth-profiles.json
      if (authType === 'oauth' && oauthToken) {
        const agentDir = path.join(workspaceDir, 'agent');
        fs.mkdirSync(agentDir, { recursive: true });
        const oauthProvider = llmProvider === 'openai' ? 'openai-codex' : llmProvider;
        const profiles = {
          profiles: [{
            id: `${oauthProvider}-default`,
            provider: oauthProvider,
            type: 'oauth',
            access: oauthToken,
            refresh: refreshToken || '',
            expires: tokenExpires || 0,
          }],
        };
        fs.writeFileSync(
          path.join(agentDir, 'auth-profiles.json'),
          JSON.stringify(profiles, null, 2),
          'utf8'
        );
      } else if (authType === 'setup-token' && oauthToken) {
        const agentDir = path.join(workspaceDir, 'agent');
        fs.mkdirSync(agentDir, { recursive: true });
        const profiles = {
          profiles: [{
            id: 'anthropic-default',
            provider: 'anthropic',
            type: 'setup_token',
            token: oauthToken,
          }],
        };
        fs.writeFileSync(
          path.join(agentDir, 'auth-profiles.json'),
          JSON.stringify(profiles, null, 2),
          'utf8'
        );
      }

      // 4b — API key / discord token → write to .conf env file
      if (apiKey || discordToken) {
        const envDir = path.join(os.homedir(), '.config', 'environment.d');
        fs.mkdirSync(envDir, { recursive: true });

        const lines = [];
        if (apiKey)       lines.push(`LLM_API_KEY=${apiKey}`);
        if (discordToken) lines.push(`DISCORD_TOKEN=${discordToken}`);
        fs.writeFileSync(path.join(envDir, `${safeName}.conf`), lines.join('\n') + '\n', 'utf8');
      }

      // Step 5 — Start agent
      send('Starting your agent... 🚀');

      await new Promise((resolve) => {
        const cmd = 'openclaw';
        const args = ['start', '--workspace', workspaceDir];
        const proc = spawn(cmd, args, { shell: true, detached: true, stdio: 'pipe' });

        let settled = false;
        const settle = () => {
          if (!settled) {
            settled = true;
            try { proc.unref(); } catch (_) {}
            resolve();
          }
        };

        const timeout = setTimeout(settle, 5000);

        proc.stdout.on('data', (d) => {
          const line = d.toString().toLowerCase();
          if (line.includes('gateway') || line.includes('started') || line.includes('ready')) {
            clearTimeout(timeout);
            settle();
          }
        });

        proc.on('error', () => { clearTimeout(timeout); settle(); });
        proc.on('close', () => { clearTimeout(timeout); settle(); });
      });

      // Step 6 — Done
      send('Your agent is live! 🎉');

      return { success: true, workspacePath: workspaceDir };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Something went wrong. Please make sure OpenClaw is installed.',
      };
    }
  });

  // ── get-agent-status ─────────────────────────────────────────────────────────
  ipcMain.handle('get-agent-status', async (_event, agentName) => {
    try {
      const out = await runCommand('openclaw status');
      const lower = out.toLowerCase();
      if (lower.includes(agentName.toLowerCase())) {
        if (lower.includes('running')) return 'running';
        if (lower.includes('stopped')) return 'stopped';
      }
      return 'unknown';
    } catch (_) {
      return 'unknown';
    }
  });

  // ── stop-agent ───────────────────────────────────────────────────────────────
  ipcMain.handle('stop-agent', async (_event, agentName) => {
    try {
      await runCommand(`openclaw stop ${agentName}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── open-external ────────────────────────────────────────────────────────────
  ipcMain.handle('open-external', async (_event, url) => {
    await shell.openExternal(url);
  });
}

module.exports = { registerHandlers };
