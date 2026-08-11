import { _electron as electron } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const project = path.resolve(process.argv[2] ?? path.join(root, 'examples', 'hello-world'));
const output = path.join(root, 'docs', 'assets');
const frames = path.join(output, 'community-preview-frames');
await mkdir(frames, { recursive: true });

const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({
  executablePath: path.join(
    root,
    'apps',
    'desktop',
    'node_modules',
    'electron',
    'dist',
    'electron.exe',
  ),
  args: [path.join(root, 'apps', 'desktop'), `--project=${project}`],
  env: environment,
});

try {
  const window = await app.firstWindow();
  await window.setViewportSize({ width: 1365, height: 768 });
  await window.locator('.workbench').waitFor({ state: 'visible', timeout: 30_000 });
  await window.getByRole('button', { name: 'Run', exact: true }).click();
  await window.getByText(/Compatibility engine .* running/).waitFor({ timeout: 45_000 });
  await window.locator('#display').waitFor({ state: 'visible' });
  await window.screenshot({ path: path.join(output, 'rokulab-preview.png') });
  await window.screenshot({ path: path.join(frames, '01-preview.png') });

  await window.getByRole('button', { name: 'Down', exact: true }).click();
  await window.waitForTimeout(350);
  await window.screenshot({ path: path.join(frames, '02-navigation.png') });
  await window.getByRole('button', { name: 'Right', exact: true }).click();
  await window.waitForTimeout(350);
  await window.screenshot({ path: path.join(frames, '03-navigation.png') });

  await window.getByRole('button', { name: '. MainScene.brs' }).click();
  await window.locator('.monaco-editor').waitFor({ state: 'visible', timeout: 15_000 });
  await window.waitForTimeout(500);
  await window.screenshot({ path: path.join(output, 'rokulab-editor.png') });
  await window.screenshot({ path: path.join(frames, '04-editor.png') });
} finally {
  await app.close();
}
