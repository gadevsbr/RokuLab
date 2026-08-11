import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const engineAssets = [
  ['brs-engine/brs.api.js', 'node_modules/brs-engine/lib/brs.api.js'],
  ['brs-engine/brs.api.js.LICENSE.txt', 'node_modules/brs-engine/lib/brs.api.js.LICENSE.txt'],
  ['brs-engine/brs.worker.js', 'node_modules/brs-engine/lib/brs.worker.js'],
  ['brs-engine/brs.worker.js.LICENSE.txt', 'node_modules/brs-engine/lib/brs.worker.js.LICENSE.txt'],
  ['brs-engine/brs-sg.js', 'node_modules/brs-scenegraph/lib/brs-sg.js'],
  ['brs-engine/brs-sg.js.LICENSE.txt', 'node_modules/brs-scenegraph/lib/brs-sg.js.LICENSE.txt'],
  ['assets/common.zip', 'node_modules/brs-scenegraph/assets/common.zip'],
] as const;

const compatibilityEngine = (): Plugin => ({
  name: 'rokulab-compatibility-engine',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const asset = engineAssets.find(([output]) => `/${output}` === request.url);
      if (!asset) return next();
      response.statusCode = 200;
      response.end(readFileSync(path.resolve(import.meta.dirname, asset[1])));
    });
  },
  generateBundle() {
    for (const [fileName, input] of engineAssets)
      this.emitFile({
        type: 'asset',
        fileName,
        source: readFileSync(path.resolve(import.meta.dirname, input)),
      });
  },
});

export default defineConfig({
  plugins: [react(), compatibilityEngine()],
  base: './',
  server: {
    host: '127.0.0.1',
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: { outDir: 'dist' },
});
