const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkPrereqs: () =>
    ipcRenderer.invoke('check-prereqs'),

  installOpenclaw: (onProgress) => {
    const listener = (_, message) => onProgress(message);
    ipcRenderer.on('install-progress', listener);
    return ipcRenderer
      .invoke('install-openclaw')
      .finally(() => ipcRenderer.removeListener('install-progress', listener));
  },

  deployAgent: (config) =>
    ipcRenderer.invoke('deploy-agent', config),

  getAgentStatus: (agentName) =>
    ipcRenderer.invoke('get-agent-status', agentName),

  stopAgent: (agentName) =>
    ipcRenderer.invoke('stop-agent', agentName),

  openExternal: (url) =>
    ipcRenderer.invoke('open-external', url),

  onDeployProgress: (callback) => {
    const listener = (_, message) => callback(message);
    ipcRenderer.on('deploy-progress', listener);
    return () => ipcRenderer.removeListener('deploy-progress', listener);
  },
});
