import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import ts from 'typescript';
import { readText, repoFiles } from './ai-guide-docs.mjs';

function* walk(node) {
  yield node;
  for (const child of node.children ?? []) yield* walk(child);
}

function headingIds(nodes) {
  const ids = new Set();
  for (const node of nodes) {
    if (node.type !== 'heading') continue;
    const text = [...walk(node)].map(child => child.value ?? '').join('');
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, '').replaceAll(' ', '-');
    let id = base;
    for (let n = 1; ids.has(id); n++) id = base + '-' + n;
    ids.add(id);
  }
  return ids;
}

function checkLinks(root, nodes) {
  const guide = join(root, 'AI-GUIDE.md');
  const anchors = new Map([[guide, headingIds(nodes)]]);
  let count = 0;
  for (const node of nodes) {
    if (node.type !== 'link') continue;
    const url = decodeURI(node.url);
    if (/^https?:/.test(url) && !url.startsWith(repoFiles)) continue;
    if (!url.startsWith('#') && !url.startsWith(repoFiles)) {
      throw new Error('AI-GUIDE.md:' + node.position.start.line + ' use a repository URL for files outside the packaged guide: ' + url);
    }
    const [path, fragment] = url.replace(repoFiles, '').split('#');
    const file = path ? resolve(root, path) : guide;
    if (!existsSync(file)) throw new Error('AI-GUIDE.md:' + node.position.start.line + ' missing file: ' + url);
    if (fragment) {
      if (!anchors.has(file)) anchors.set(file, headingIds(walk(fromMarkdown(readText(file)))));
      if (!anchors.get(file).has(fragment)) {
        throw new Error('AI-GUIDE.md:' + node.position.start.line + ' missing anchor: ' + url);
      }
    }
    count++;
  }
  return count;
}

// Compile every fenced TSX block as its own module using the docs application's
// strict settings and the current package entry. Diagnostics point into Markdown.
export function checkGuide(root, markdown) {
  const nodes = [...walk(fromMarkdown(markdown))];
  const links = checkLinks(root, nodes);
  const docs = join(root, 'apps/docs');
  const config = ts.readConfigFile(join(docs, 'tsconfig.json'), ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, docs);
  const host = ts.createCompilerHost(options);
  const snippets = new Map();
  for (const node of nodes.filter(node => node.type === 'code' && node.lang === 'tsx')) {
    const line = node.position.start.line;
    const localImport = ts.preProcessFile(node.value).importedFiles.find(file => file.fileName.startsWith('.'));
    if (localImport) throw new Error('AI-GUIDE.md:' + line + ' example imports a file absent from the package: ' + localImport.fileName);
    for (const [, asset] of node.value.matchAll(/['"](\.\/samples\/[\w./-]+)['"]/g)) {
      if (!existsSync(join(docs, 'public', asset))) throw new Error('AI-GUIDE.md:' + line + ' missing example asset: ' + asset);
    }
    const path = join(docs, 'src', 'guide-example-' + line + '.tsx');
    snippets.set(host.getCanonicalFileName(resolve(path)), { path, code: node.value, line });
  }
  if (!snippets.size) throw new Error('No TSX examples found in AI-GUIDE.md');
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (name, ...args) => {
    const snippet = snippets.get(host.getCanonicalFileName(resolve(name)));
    return snippet ? ts.createSourceFile(name, snippet.code, args[0], true, ts.ScriptKind.TSX) : getSourceFile(name, ...args);
  };
  const program = ts.createProgram([...snippets.values()].map(snippet => snippet.path), options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    throw new Error(diagnostics.map(diagnostic => {
      const { file, start, messageText } = diagnostic;
      const snippet = file && snippets.get(host.getCanonicalFileName(resolve(file.fileName)));
      const line = file && start !== undefined ? file.getLineAndCharacterOfPosition(start).line + 1 : 0;
      const at = snippet ? 'AI-GUIDE.md:' + (snippet.line + line) : file?.fileName ?? 'TypeScript';
      return at + ' TS' + diagnostic.code + ' ' + ts.flattenDiagnosticMessageText(messageText, '\n');
    }).join('\n'));
  }
  console.log('AI-GUIDE.md: ' + snippets.size + ' TSX examples compiled, ' + links + ' links checked.');
}
