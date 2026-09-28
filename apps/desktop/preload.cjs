const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('recallOpsDesktop', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron,
});
