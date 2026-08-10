import { spawn } from 'node:child_process';
import path from 'node:path';

const workspace = path.resolve(import.meta.dirname, '..');
const desktop = path.join(workspace, 'apps', 'desktop');
const cli = path.join(workspace, 'apps', 'desktop', 'node_modules', 'electron-builder', 'cli.js');
const env = {
  ...process.env,
  PATH: `${import.meta.dirname}${path.delimiter}${process.env.PATH ?? ''}`,
};
const builder = spawn(process.execPath, [cli, '--win', 'portable', '--x64'], {
  cwd: desktop,
  env,
  stdio: 'inherit',
});

builder.on('exit', (code) => process.exit(code ?? 1));
