import { app, BrowserWindow, dialog, ipcMain, protocol, session } from 'electron';
import { type FSWatcher, watch } from 'chokidar';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  archiveProject,
  loadProject,
  readProjectFile,
  writeProjectFile,
} from '@rokulab/project-loader';

const directory = path.dirname(fileURLToPath(import.meta.url));
const watchers = new Map<number, FSWatcher>();
const roots = new Map<number, string>();
const reloadTimers = new Map<number, NodeJS.Timeout>();

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'rokulab',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
]);

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
    const allowed = process.env.VITE_DEV_SERVER_URL ?? 'rokulab://app/';
    if (!url.startsWith(allowed)) event.preventDefault();
  });
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) void window.loadURL(devUrl);
  else void window.loadURL('rokulab://app/index.html');
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
ipcMain.handle('project:archive', (event) => {
  const root = roots.get(event.sender.id);
  if (!root) throw new Error('No active project');
  return archiveProject(root).then((archive) =>
    archive.buffer.slice(archive.byteOffset, archive.byteOffset + archive.byteLength),
  );
});

app.whenReady().then(() => {
  protocol.handle('rokulab', async (request) => {
    const root = path.resolve(directory, '../dist');
    const relative = decodeURIComponent(new URL(request.url).pathname).replace(/^[/\\]+/, '');
    const target = path.resolve(root, relative || 'index.html');
    if (target !== root && !target.startsWith(`${root}${path.sep}`))
      return new Response('Not found', { status: 404 });
    try {
      const file = await readFile(target);
      const body = Uint8Array.from(file).buffer;
      const contentTypes: Record<string, string> = {
        '.css': 'text/css',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
      };
      return new Response(body, {
        headers: {
          'Content-Type': contentTypes[path.extname(target)] ?? 'application/octet-stream',
        },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
  session.defaultSession.webRequest.onHeadersReceived((details, callback) =>
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Embedder-Policy': ['require-corp'],
        'Cross-Origin-Opener-Policy': ['same-origin'],
      },
    }),
  );
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
