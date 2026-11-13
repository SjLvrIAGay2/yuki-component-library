import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';
import manifest from './package.json';

// Make every published subpath an entry so Rollup keeps its index.js facade.
const entries = ['index', 'theme/index', 'locale/index', 'animation/index',
  ...readdirSync(resolve(__dirname, 'src/components')).map(name => `components/${name}/index`),
].filter(name => existsSync(resolve(__dirname, 'src', name + '.ts')) || existsSync(resolve(__dirname, 'src', name + '.tsx')));
const packageNames = new Set([...Object.keys(manifest.dependencies), ...Object.keys(manifest.peerDependencies)]);

/**
 * Library build.
 *
 * - Single ESM entry (`src/index.ts`) with preserved module structure so every
 *   component stays individually importable and tree-shakable.
 * - One aggregated stylesheet (`dist/yuki-ui.css`).
 * - Declarations emitted per module, preserving the same layout as `dist`.
 */
export default defineConfig({
  base: './',
  plugins: [
    react(),
    dts({
      include: ['src'],
      compilerOptions: { declarationMap: false },
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts', 'src/test/**'],
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  worker: { format: 'es' },
  build: {
    lib: {
      entry: Object.fromEntries(entries.map(name => [name, resolve(__dirname, 'src', name)])),
      formats: ['es'],
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: id => packageNames.has(id.startsWith('@') ? id.split('/').slice(0, 2).join('/') : id.split('/')[0]!),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (asset) => {
          const name = asset.names?.[0] ?? asset.name ?? '';
          return name.endsWith('.css') ? 'yuki-ui.css' : 'assets/[name][extname]';
        },
      },
    },
  },
});
