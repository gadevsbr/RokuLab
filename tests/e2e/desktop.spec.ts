import { _electron as electron, expect, test, type ElectronApplication } from '@playwright/test';
import { execFile } from 'node:child_process';
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

test('desktop opens the bundled project and renders the vertical slice', async () => {
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
    await window.getByRole('button', { name: 'Label #title' }).click();
    await expect(window.getByRole('heading', { name: 'PROPERTIES #title' })).toBeVisible();
    await expect(window.getByTitle('Hello from RokuLab')).toBeVisible();
    await writeFile(
      scriptPath,
      'sub init()\n  print "Hot reload verified"\n  m.top.findNode("title").text = "Hot Reload Works"\nend sub\n',
    );
    await expect(window.getByText('Hot reloaded components/MainScene.brs')).toBeVisible();
    await expect(window.locator('[data-node="title"]')).toHaveText('Hot Reload Works');
    await expect(window.getByText('Hot reload verified')).toBeVisible();
    await window.getByRole('button', { name: '. MainScene.brs' }).click();
    await expect(window.getByRole('button', { name: 'components/MainScene.brs' })).toBeVisible();
    await expect(window.locator('.monaco-editor')).toBeVisible();
  } finally {
    await writeFile(scriptPath, originalScript);
    await stopTestApplication(app);
  }
});

test('packaged Windows app opens its bundled example', async () => {
  test.skip(process.platform !== 'win32', 'Windows package smoke runs on Windows only');
  const executable = path.resolve('apps/desktop/release/win-unpacked/RokuLab.exe');
  const environment = { ...process.env };
  delete environment.ELECTRON_RUN_AS_NODE;
  const app = await electron.launch({ executablePath: executable, env: environment });
  try {
    const window = await app.firstWindow();
    await window.getByRole('button', { name: 'Open bundled Hello World' }).click();
    await expect(window.getByText('Hello from RokuLab')).toBeVisible();
    await expect(window.getByText('Hello from BrightScript')).toBeVisible();
  } finally {
    await stopTestApplication(app);
  }
});
