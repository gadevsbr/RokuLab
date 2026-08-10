import { spawn } from 'node:child_process';

const shell = process.platform === 'win32';
const vite = spawn('corepack pnpm exec vite', { shell, stdio: ['inherit', 'pipe', 'inherit'] });
let electron;

vite.stdout.on('data', (chunk) => {
  const output = chunk.toString();
  process.stdout.write(output);
  if (!electron && output.includes('Local:')) {
    const env = { ...process.env, VITE_DEV_SERVER_URL: 'http://127.0.0.1:5173' };
    delete env.ELECTRON_RUN_AS_NODE;
    electron = spawn('corepack pnpm exec electron .', {
      cwd: new URL('../apps/desktop', import.meta.url),
      env,
      shell,
      stdio: 'inherit',
    });
    electron.on('exit', () => vite.kill());
  }
});

process.on('SIGINT', () => {
  electron?.kill();
  vite.kill();
});
