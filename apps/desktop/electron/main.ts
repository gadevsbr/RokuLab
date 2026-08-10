import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProject } from '@rokulab/project-loader';

const directory = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 650,
    backgroundColor: '#101318',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(directory, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) void window.loadURL(devUrl);
  else void window.loadFile(path.join(directory, '../dist/index.html'));
}

ipcMain.handle('project:choose', async () => {
  const selected = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Open Roku project',
  });
  if (selected.canceled || !selected.filePaths[0]) return null;
  return loadProject(selected.filePaths[0]);
});
ipcMain.handle('project:openPath', (_event, selectedPath: unknown) => {
  if (typeof selectedPath !== 'string' || !path.isAbsolute(selectedPath))
    throw new Error('An absolute project path is required');
  return loadProject(selectedPath);
});
ipcMain.handle('project:openExample', () =>
  loadProject(path.resolve(directory, '../../../examples/hello-world')),
);

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
