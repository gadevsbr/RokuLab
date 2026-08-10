import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { type FSWatcher, watch } from 'chokidar';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProject, readProjectFile, writeProjectFile } from '@rokulab/project-loader';

const directory = path.dirname(fileURLToPath(import.meta.url));
const watchers = new Map<number, FSWatcher>();
const roots = new Map<number, string>();
const reloadTimers = new Map<number, NodeJS.Timeout>();

async function watchProject(window: BrowserWindow, rootPath: string): Promise<void> {
  await watchers.get(window.webContents.id)?.close();
  roots.set(window.webContents.id, rootPath);
  const watcher = watch(['manifest', 'source', 'components', 'images', 'fonts', 'locale'], {
    cwd: rootPath,
    ignoreInitial: true,
    ignored: /(^|[/\\])\../,
  });
  const reload = (changedPath: string) => {
    const previous = reloadTimers.get(window.webContents.id);
    if (previous) clearTimeout(previous);
    reloadTimers.set(
      window.webContents.id,
      setTimeout(async () => {
        try {
          window.webContents.send('project:changed', {
            changedPath: changedPath.replaceAll('\\', '/'),
            snapshot: await loadProject(rootPath),
          });
        } catch (error) {
          window.webContents.send(
            'project:watchError',
            error instanceof Error ? error.message : String(error),
          );
        }
      }, 150),
    );
  };
  watcher.on('add', reload).on('change', reload).on('unlink', reload);
  watchers.set(window.webContents.id, watcher);
  window.once('closed', () => {
    void watcher.close();
    watchers.delete(window.webContents.id);
    roots.delete(window.webContents.id);
  });
}

async function activateProject(window: BrowserWindow, projectPath: string) {
  const snapshot = await loadProject(projectPath);
  await watchProject(window, snapshot.rootPath);
  return snapshot;
}

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
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    const allowed =
      process.env.VITE_DEV_SERVER_URL ?? `file://${path.join(directory, '../dist/index.html')}`;
    if (!url.startsWith(allowed)) event.preventDefault();
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) void window.loadURL(devUrl);
  else void window.loadFile(path.join(directory, '../dist/index.html'));
}

ipcMain.handle('project:choose', async (event) => {
  const selected = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Open Roku project',
  });
  if (selected.canceled || !selected.filePaths[0]) return null;
  return activateProject(BrowserWindow.fromWebContents(event.sender)!, selected.filePaths[0]);
});
ipcMain.handle('project:openPath', (event, selectedPath: unknown) => {
  if (typeof selectedPath !== 'string' || !path.isAbsolute(selectedPath))
    throw new Error('An absolute project path is required');
  return activateProject(BrowserWindow.fromWebContents(event.sender)!, selectedPath);
});
ipcMain.handle('project:openExample', (event) =>
  activateProject(
    BrowserWindow.fromWebContents(event.sender)!,
    app.isPackaged
      ? path.join(app.getAppPath(), 'examples/hello-world')
      : path.resolve(directory, '../../../examples/hello-world'),
  ),
);
ipcMain.handle('project:readFile', (event, relative: unknown) => {
  const root = roots.get(event.sender.id);
  if (!root || typeof relative !== 'string')
    throw new Error('No active project or invalid file path');
  return readProjectFile(root, relative);
});
ipcMain.handle('project:writeFile', (event, relative: unknown, content: unknown) => {
  const root = roots.get(event.sender.id);
  if (!root || typeof relative !== 'string' || typeof content !== 'string')
    throw new Error('No active project or invalid file update');
  return writeProjectFile(root, relative, content);
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
