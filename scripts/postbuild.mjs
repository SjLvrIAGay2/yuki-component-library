#!/usr/bin/env node
/**
 * Post-build packaging step.
 *
 * Vite emits the aggregated stylesheet (`dist/yuki-ui.css`) because the library
 * entry imports `styles/index.css`. The token layer is also published on its
 * own (`@yuki-ui/react/tokens.css`) so consumers can compose tokens without
 * pulling every component style, so copy it into `dist` and assert both files
 * exist before the package is publishable.
 */
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const uiRoot = join(root, 'packages', 'ui');
const dist = join(uiRoot, 'dist');

const required = [join(dist, 'index.js'), join(dist, 'index.d.ts'), join(dist, 'yuki-ui.css')];
const missing = required.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error('postbuild: missing build artifacts:\n  ' + missing.join('\n  '));
  process.exit(1);
}

copyFileSync(join(uiRoot, 'src', 'styles', 'tokens.css'), join(dist, 'tokens.css'));
copyFileSync(join(root, 'AI-GUIDE.md'), join(dist, 'AI-GUIDE.md'));

// Declarations emitted for bundler resolution can contain extensionless paths.
// Use the published ESM layout for both bundler and NodeNext consumers.
for (const file of readdirSync(dist, { recursive: true }).filter(name => name.endsWith('.d.ts'))) {
  const path = join(dist, file);
  const source = readFileSync(path, 'utf8');
  let result = source;
  for (const { fileName, end } of ts.preProcessFile(source).importedFiles.reverse()) {
    if (!fileName.startsWith('.') || /\.(?:[cm]?js|json|css)$/.test(fileName)) continue;
    const target = resolve(dirname(path), fileName);
    const suffix = existsSync(target + '.d.ts') ? '.js' : '/index.js';
    if (!existsSync(target + suffix.replace(/\.js$/, '.d.ts'))) {
      throw new Error(`Unresolved declaration import ${fileName} in ${file}`);
    }
    // TypeScript reports the opening quote as pos and the last character as end.
    result = result.slice(0, end + 1) + suffix + result.slice(end + 1);
  }
  if (result !== source) writeFileSync(path, result);
}
// Stylesheets are side-effect imports with no JS exports.
writeFileSync(join(dist, 'styles.css.d.ts'), 'export {};\n');

const size = (file) => `${(statSync(file).size / 1024).toFixed(1)} KB`;
console.log(
  `postbuild: yuki-ui.css ${size(join(dist, 'yuki-ui.css'))}, tokens.css ${size(join(dist, 'tokens.css'))}, index.js ${size(join(dist, 'index.js'))}`,
);
