import { _electron as electron, expect, test } from '@playwright/test';
import path from 'node:path';

test('desktop opens the bundled project and renders the vertical slice', async () => {
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
  } finally {
    await app.close();
  }
});
