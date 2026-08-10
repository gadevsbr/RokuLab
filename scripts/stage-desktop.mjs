import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const workspace = path.resolve(import.meta.dirname, '..');
const desktop = path.join(workspace, 'apps', 'desktop');
const staging = path.join(desktop, 'package-app');

if (path.dirname(staging) !== desktop || path.basename(staging) !== 'package-app') {
  throw new Error('Refusing to recreate an unexpected staging directory');
}

await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
await Promise.all([
  cp(path.join(desktop, 'dist'), path.join(staging, 'dist'), { recursive: true }),
  cp(path.join(desktop, 'dist-electron'), path.join(staging, 'dist-electron'), {
    recursive: true,
  }),
  cp(
    path.join(workspace, 'examples', 'hello-world'),
    path.join(staging, 'examples', 'hello-world'),
    { recursive: true },
  ),
]);

await writeFile(
  path.join(staging, 'package.json'),
  `${JSON.stringify(
    {
      name: 'rokulab-desktop',
      version: '0.1.0-alpha.1',
      description: 'The missing development environment for Roku.',
      author: 'RokuLab contributors',
      license: 'MIT',
      main: 'dist-electron/main.js',
    },
    null,
    2,
  )}\n`,
  'utf8',
);
