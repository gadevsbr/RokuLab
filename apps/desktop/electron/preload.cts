import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('rokulab', {
  chooseProject: () => ipcRenderer.invoke('project:choose'),
  openPath: (projectPath: string) => ipcRenderer.invoke('project:openPath', projectPath),
  openExample: () => ipcRenderer.invoke('project:openExample'),
  readFile: (relative: string) => ipcRenderer.invoke('project:readFile', relative),
  writeFile: (relative: string, content: string) =>
    ipcRenderer.invoke('project:writeFile', relative, content),
  archiveProject: async () => new Uint8Array(await ipcRenderer.invoke('project:archive')),
  onProjectChanged: (listener: (change: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, change: unknown) => listener(change);
    ipcRenderer.on('project:changed', handler);
    return () => ipcRenderer.removeListener('project:changed', handler);
  },
  onWatchError: (listener: (message: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, message: string) => listener(message);
    ipcRenderer.on('project:watchError', handler);
    return () => ipcRenderer.removeListener('project:watchError', handler);
  },
});
