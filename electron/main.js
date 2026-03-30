const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const isDev = process.env.ELECTRON_IS_DEV === '1';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    title: 'AgentForge',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In the packaged app, electron-builder maps ../frontend/out/** into
    // the app root alongside main.js, so the path is just frontend/out/index.html
    const fs = require('fs');
    const candidates = [
      path.join(__dirname, 'frontend', 'out', 'index.html'),
      path.join(__dirname, '..', 'frontend', 'out', 'index.html'),
      path.join(process.resourcesPath, 'frontend', 'out', 'index.html'),
    ];
    const indexPath = candidates.find(fs.existsSync) ?? candidates[0];
    mainWindow.loadFile(indexPath).catch((err) => {
      // Fallback: show an error page so it's not just a black screen
      mainWindow.loadURL(`data:text/html,<h2 style="font-family:sans-serif;padding:40px;color:#e2e8f0;background:#0a0a0f;margin:0">Could not load AgentForge UI.<br><small style="color:#666">${indexPath}</small></h2>`);
    });
    // Temporary: open devtools to debug rendering issues
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  const { registerHandlers } = require('./ipc-handlers');
  registerHandlers(ipcMain, () => mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
