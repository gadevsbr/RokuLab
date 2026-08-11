import { _electron as electron, expect, test, type ElectronApplication } from '@playwright/test';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function stopTestApplication(app: ElectronApplication): Promise<void> {
  const closed = new Promise<void>((resolve) => app.once('close', resolve));
  if (process.platform === 'win32') {
    await execFileAsync('taskkill', ['/PID', String(app.process().pid), '/T', '/F']).catch(
      () => undefined,
    );
  } else {
    app.process().kill('SIGKILL');
  }
  await closed;
}

async function canvasSignature(window: Awaited<ReturnType<ElectronApplication['firstWindow']>>) {
  return window.locator('#display').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data;
    if (!pixels) return 0;
    let hash = 2166136261;
    for (let index = 0; index < pixels.length; index += 997)
      hash = Math.imul(hash ^ pixels[index], 16777619);
    return hash >>> 0;
  });
}

test('desktop opens the bundled project and renders the vertical slice', async () => {
  test.setTimeout(60_000);
  const scriptPath = path.resolve('examples/hello-world/components/MainScene.brs');
  const originalScript = await readFile(scriptPath, 'utf8');
  const environment = { ...process.env };
  delete environment.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    executablePath: path.resolve(
      'node_modules/.pnpm/electron@43.3.0/node_modules/electron/dist/electron.exe',
    ),
    args: [path.resolve('apps/desktop')],
    env: environment,
  });
  try {
    const window = await app.firstWindow();
    await expect(window.getByRole('heading', { name: 'RokuLab' })).toBeVisible();
    await window.getByRole('button', { name: 'Open bundled Hello World' }).click();
    await expect(window.getByText('RokuLab Hello World').first()).toBeVisible();
    await expect(window.getByText('Hello from RokuLab')).toBeVisible();
    await expect(window.getByText('Hello from BrightScript')).toBeVisible();
    await expect(window.getByRole('heading', { name: 'RUNNING TV' })).toBeVisible();
    const [explorer, workspace, preview, remote] = await Promise.all([
      window.locator('.explorer').boundingBox(),
      window.locator('.display').boundingBox(),
      window.locator('.preview-device').boundingBox(),
      window.locator('.remote-panel').boundingBox(),
    ]);
    expect(explorer).not.toBeNull();
    expect(workspace).not.toBeNull();
    expect(preview).not.toBeNull();
    expect(remote).not.toBeNull();
    expect(explorer!.x).toBeLessThan(workspace!.x);
    expect(preview!.x).toBeLessThan(remote!.x);
    expect(preview!.width).toBeGreaterThan(remote!.width);
    await window.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(window.getByText(/Compatibility engine .* running/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(window.locator('#display')).toBeVisible();
    await expect(window.getByRole('button', { name: 'Stop', exact: true })).toBeEnabled();
    await expect(
      window.locator('.output p').filter({ hasText: 'Observer fired: true' }),
    ).toHaveCount(1);
    await expect
      .poll(
        () =>
          window.locator('#display').evaluate((canvas: HTMLCanvasElement) => {
            const pixels = canvas.getContext('2d')?.getImageData(0, 0, 1920, 1080).data;
            if (!pixels) return false;
            for (let index = 3; index < pixels.length; index += 4)
              if (pixels[index] !== 0) return true;
            return false;
          }),
        { timeout: 15_000 },
      )
      .toBe(true);
    await window.getByRole('button', { name: 'Right', exact: true }).click();
    await expect(window.getByText('last input').locator('..')).toContainText('right');
    await window.getByRole('button', { name: 'Label #title' }).click();
    await expect(window.getByRole('heading', { name: 'PROPERTIES #title' })).toBeVisible();
    await expect(window.getByTitle('Hello from RokuLab')).toBeVisible();
    await writeFile(
      scriptPath,
      'sub init()\n  print "Hot reload verified"\n  m.top.findNode("title").text = "Hot Reload Works"\nend sub\n',
    );
    await expect(window.getByText(/Compatibility engine .* running/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(window.getByText('starts').locator('..')).toContainText('2');
    await window.getByRole('button', { name: 'Stop', exact: true }).click();
    await expect(window.locator('#display')).toBeHidden();
    await expect(window.locator('[data-node="title"]')).toHaveText('Hot Reload Works');
    await expect(window.getByText('Hot reload verified')).toBeVisible();
    await window.getByRole('button', { name: '. MainScene.brs' }).click();
    await expect(window.getByRole('button', { name: 'components/MainScene.brs' })).toBeVisible();
    await expect(window.locator('.monaco-editor')).toBeVisible();
    await expect(window.locator('.remote-panel')).toHaveCount(0);
    const editor = await window.locator('.editor-shell').boundingBox();
    expect(editor).not.toBeNull();
    expect(editor!.x).toBe(workspace!.x);
    expect(Math.abs(editor!.width - workspace!.width)).toBeLessThanOrEqual(1);
  } finally {
    await writeFile(scriptPath, originalScript);
    await stopTestApplication(app);
  }
});

test('desktop closes cleanly with an active project watcher', async () => {
  const scriptPath = path.resolve('examples/hello-world/components/MainScene.brs');
  const originalScript = await readFile(scriptPath, 'utf8');
  const environment = { ...process.env };
  delete environment.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    executablePath: path.resolve(
      'node_modules/.pnpm/electron@43.3.0/node_modules/electron/dist/electron.exe',
    ),
    args: [path.resolve('apps/desktop')],
    env: environment,
  });
  let closed = false;
  try {
    const window = await app.firstWindow();
    await window.getByRole('button', { name: 'Open bundled Hello World' }).click();
    await expect(window.getByText('Hello from RokuLab')).toBeVisible();
    await writeFile(scriptPath, `${originalScript}\n' trigger pending watcher cleanup\n`);
    const closeEvent = new Promise<void>((resolve) => app.once('close', resolve));
    void app.close();
    await Promise.race([
      closeEvent,
      new Promise<never>((_resolve, reject) =>
        setTimeout(() => reject(new Error('Electron did not close cleanly')), 10_000),
      ),
    ]);
    closed = true;
  } finally {
    await writeFile(scriptPath, originalScript);
    if (!closed) await stopTestApplication(app);
  }
});

test('packaged Windows app opens its bundled example', async () => {
  test.skip(process.platform !== 'win32', 'Windows package smoke runs on Windows only');
  const executable = path.resolve('apps/desktop/release/win-unpacked/RokuLab.exe');
  const environment = { ...process.env };
  delete environment.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ executablePath: executable, env: environment });
  let closed = false;
  try {
    const window = await app.firstWindow();
    await window.getByRole('button', { name: 'Open bundled Hello World' }).click();
    await expect(window.getByText('Hello from RokuLab')).toBeVisible();
    await expect(window.getByText('Hello from BrightScript')).toBeVisible();
    await window.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(window.getByText(/Compatibility engine .* running/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(window.locator('#display')).toBeVisible();
    const closeEvent = new Promise<void>((resolve) => app.once('close', resolve));
    void app.close();
    await closeEvent;
    closed = true;
  } finally {
    if (!closed) await stopTestApplication(app);
  }
});

test('IEDB navigation shell starts in the compatibility engine', async () => {
  test.setTimeout(60_000);
  const project = 'C:\\Users\\Hans Braga\\Desktop\\IEB\\roku';
  test.skip(!existsSync(project), 'Local IEDB reference channel is unavailable');
  const environment = { ...process.env };
  delete environment.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({
    executablePath: path.resolve(
      'node_modules/.pnpm/electron@43.3.0/node_modules/electron/dist/electron.exe',
    ),
    args: [path.resolve('apps/desktop'), `--project=${project}`],
    env: environment,
  });
  try {
    const window = await app.firstWindow();
    await expect(window.getByText('IEDB').first()).toBeVisible({ timeout: 15_000 });
    await window.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(window.getByText(/Compatibility engine .* running/)).toBeVisible({
      timeout: 30_000,
    });
    await expect(window.getByText('started').first()).toBeVisible({ timeout: 30_000 });
    await expect(
      window.getByRole('heading', { name: /LIVE FIELD UPDATES \([1-9]\d*\)/ }),
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(window.getByRole('heading', { name: /RUNTIME CALLS \(\d+\)/ })).toBeVisible();
    await expect(window.getByRole('heading', { name: /OBSERVER CALLS \(\d+\)/ })).toBeVisible();
    await expect(window.getByRole('heading', { name: /LIVE NODES \([1-9]\d*\)/ })).toBeVisible();
    await expect(window.getByRole('heading', { name: /FOCUS CHAIN \(\d+\)/ })).toBeVisible();
    await window.locator('.runtime-tree button').first().click();
    await expect(window.getByRole('heading', { name: /LIVE PROPERTIES/ })).toBeVisible();
    await expect(
      window.locator('.inspector dt').getByText('address', { exact: true }),
    ).toBeVisible();
    await expect(window.locator('#display')).toBeVisible();
    const home = await canvasSignature(window);
    await window.getByRole('button', { name: 'Down', exact: true }).click();
    await window.getByRole('button', { name: 'Right', exact: true }).click();
    await expect(window.getByText('last input').locator('..')).toContainText('right');
    await expect.poll(() => canvasSignature(window)).not.toBe(home);
    const exploreFocus = await canvasSignature(window);
    await window.getByRole('button', { name: 'OK', exact: true }).click();
    await expect.poll(() => canvasSignature(window), { timeout: 15_000 }).not.toBe(exploreFocus);
    await window.getByRole('button', { name: 'Left', exact: true }).click();
    await window.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(window.getByText(/Compatibility engine .* running/)).toBeVisible();
    const detail = await canvasSignature(window);
    await window.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(window.getByText('last input').locator('..')).toContainText('back');
    await expect.poll(() => canvasSignature(window), { timeout: 15_000 }).not.toBe(detail);
    await expect(
      window.locator('.inspector dt').getByText('state', { exact: true }).locator('..'),
    ).toContainText('running');
  } finally {
    await stopTestApplication(app);
  }
});
