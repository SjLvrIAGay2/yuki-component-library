import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const uiRoot = resolve(__dirname, '../../packages/ui/src');

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@yuki-ui/react/styles.css',
        replacement: resolve(uiRoot, 'styles/index.css'),
      },
      {
        find: '@yuki-ui/react/components/code-block',
        replacement: resolve(uiRoot, 'components/code-block/index.ts'),
      },
      {
        find: /^@yuki-ui\/react$/,
        replacement: resolve(uiRoot, 'index.ts'),
      },
    ],
  },
  server: {
    port: 5178,
    fs: { allow: [resolve(__dirname, '../..')] },
  },
  worker: { format: 'es' },
  build: {
    outDir: resolve(__dirname, '../../site-dist'),
    emptyOutDir: true,
    sourcemap: false,
  },
});
