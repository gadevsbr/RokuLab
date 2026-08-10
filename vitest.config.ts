import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
  resolve: {
    alias: {
      '@rokulab/shared': path.resolve('packages/shared/src/index.ts'),
      '@rokulab/manifest-parser': path.resolve('packages/manifest-parser/src/index.ts'),
      '@rokulab/scenegraph': path.resolve('packages/scenegraph/src/index.ts'),
      '@rokulab/brightscript-runtime': path.resolve('packages/brightscript-runtime/src/index.ts'),
      '@rokulab/project-loader': path.resolve('packages/project-loader/src/index.ts'),
    },
  },
});
