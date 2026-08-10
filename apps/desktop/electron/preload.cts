import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('rokulab', {
  chooseProject: () => ipcRenderer.invoke('project:choose'),
  openPath: (projectPath: string) => ipcRenderer.invoke('project:openPath', projectPath),
  openExample: () => ipcRenderer.invoke('project:openExample'),
});
