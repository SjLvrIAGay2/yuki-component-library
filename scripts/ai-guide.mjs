/**
 * Sync the reference blocks in AI-GUIDE.md from public TypeScript entry points.
 * The usage notes and examples outside those blocks are edited in Markdown.
 * Run with --check to verify coverage and detect stale signatures.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'packages/ui/src');
const guide = join(root, 'AI-GUIDE.md');
const config = ts.readConfigFile(join(root, 'packages/ui/tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(source));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
const typeFlags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
const entryPoints = new Map(['theme', 'locale', 'animation', 'hooks'].map(name => [name, name]));
for (const dir of readdirSync(join(source, 'components'), { withFileTypes: true })) {
  if (!dir.isDirectory() || /^[_.]/.test(dir.name)) continue;
  const entry = 'components/' + dir.name;
  if (program.getSourceFile(join(source, entry, 'index.ts'))) entryPoints.set(dir.name, entry);
}

const symbolOf = node => {
  const symbol = checker.getSymbolAtLocation(node);
  return symbol?.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
};
const publicNames = new Set();
for (const path of entryPoints.values()) {
  const entry = program.getSourceFile(join(source, path, 'index.ts'));
  for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(entry))) {
    publicNames.add(symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol);
  }
}
const print = node => printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())
  .replace(/^export (?:declare )?/, '').replace(/\r\n/g, '\n');
const isType = node => ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
const isLocal = node => {
  const path = relative(source, node.getSourceFile().fileName);
  return !path.startsWith('..') && !path.includes('node_modules');
};
const docPath = slug => {
  const pages = join(root, 'apps/docs/src/content');
  for (const group of readdirSync(pages)) {
    if (ts.sys.fileExists(join(pages, group, slug + '.md'))) {
      return 'apps/docs/src/content/' + group + '/' + slug + '.md';
    }
  }
};

// Summarize homogeneous style maps once and preserve nested slots' actual types.
function declarationText(declaration, name) {
  // Expand aliases that would otherwise refer to private runtime objects.
  if (['IconName', 'LocaleMessages', 'PlayerControlsState'].includes(name)) {
    const type = checker.getDeclaredTypeOfSymbol(symbolOf(declaration.name));
    const expanded = checker.typeToString(type, declaration, typeFlags | ts.TypeFormatFlags.InTypeAlias);
    return 'type ' + name + ' = ' + expanded.replace(/; (?=[a-zA-Z])/g, ';\n    ') + ';';
  }
  if (ts.isInterfaceDeclaration(declaration)) {
    const members = declaration.members.filter(member => !member.name?.getText().startsWith('__'));
    const head = print(declaration).split('{')[0].trim().replace(/\s+/g, ' ');
    const index = members.find(member => !member.name || !ts.isPropertySignature(member));
    if (!declaration.heritageClauses?.length && !index && /(ClassNames|Styles)$/.test(name) && members.every(member =>
      member.questionToken && ['string', 'CSSProperties'].includes(member.type?.getText()))) {
      const keys = members.map(member => "'" + member.name.getText() + "'").join(' | ') || 'never';
      return 'type ' + name + ' = Partial<Record<' + keys + ', ' + (name.endsWith('Styles') ? 'CSSProperties' : 'string') + '>>;';
    }
    if (members.length < declaration.members.length) {
      return head + ' {\n' + members.map(member => '    ' + print(member)).join('\n') + '\n}';
    }
  }
  return print(declaration);
}

function refBlock(slug) {
  const path = entryPoints.get(slug);
  if (!path) throw new Error('Unknown reference section: ' + slug);
  const entry = program.getSourceFile(join(source, path, 'index.ts'));
  const symbols = checker.getExportsOfModule(checker.getSymbolAtLocation(entry));
  const runtime = [];
  const declarations = new Map();
  const calls = [];
  const extras = new Map();
  const addDependencies = node => {
    // Only follow local named types. React, DOM and Radix retain library type names.
    if (ts.isTypeReferenceNode(node) || ts.isExpressionWithTypeArguments(node)) {
      const symbol = symbolOf(node.typeName ?? node.expression);
      const declaration = symbol?.declarations?.find(isType);
      if (declaration && isLocal(declaration) && !publicNames.has(symbol) && !extras.has(symbol)) {
        extras.set(symbol, declaration);
        addDependencies(declaration);
      }
    }
    ts.forEachChild(node, addDependencies);
  };
  for (const exported of [...symbols].sort((a, b) => a.name < b.name ? -1 : 1)) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (symbol.flags & ts.SymbolFlags.Value) {
      runtime.push(exported.name);
      const at = symbol.valueDeclaration;
      if (at) {
        const type = checker.getTypeOfSymbolAtLocation(symbol, at);
        if (ts.isFunctionDeclaration(at)) {
          for (const param of at.parameters) if (param.type) addDependencies(param.type);
          if (at.type) addDependencies(at.type);
        }
        // Include fluent imperative APIs (message, Modal, etc.) alongside JSX overloads.
        if (['message', 'toast', 'notification', 'Modal'].includes(exported.name)) {
          for (const method of type.getProperties()) {
            const member = method.valueDeclaration;
            if (!member || !isLocal(member)) continue;
            const methodType = checker.getTypeOfSymbolAtLocation(method, member);
            for (const signature of methodType.getCallSignatures()) {
              calls.push(exported.name + '.' + method.name + checker.signatureToString(signature, member, typeFlags));
            }
          }
        }
        // Keep overloads, concrete ref targets and callback argument order.
        for (const sig of type.getCallSignatures()) {
          const formatted = checker.signatureToString(sig, at, typeFlags);
          calls.push(exported.name + formatted);
        }
      }
      continue;
    }
    const declaration = symbol.declarations?.find(isType);
    if (!declaration) continue;
    if (declaration.name.text !== exported.name) {
      declarations.set(exported.name, 'type ' + exported.name + ' = ' + declaration.name.text + ';');
    } else {
      declarations.set(exported.name, declarationText(declaration, exported.name));
    }
    addDependencies(declaration);
  }
  for (const [symbol, declaration] of extras) {
    declarations.set(symbol.name, declarationText(declaration, symbol.name));
  }
  const links = ['[类型与导出入口](' + relative(root, entry.fileName).replaceAll('\\', '/') + ')'];
  const page = docPath(slug === 'theme' ? 'config-provider' : slug);
  if (page) links.push('[交互说明](' + page + ')');
  const examples = slug === 'theme' ? 'config-provider' : slug;
  const examplesDir = join(root, 'apps/docs/src/examples', examples);
  let basicExample;
  if (ts.sys.directoryExists(examplesDir)) {
    links.push('[可运行示例](apps/docs/src/examples/' + examples + ')');
    const first = readdirSync(examplesDir).filter(file => file.endsWith('.tsx')).sort()[0];
    if (first) basicExample = readFileSync(join(examplesDir, first), 'utf8').replace(/\r\n/g, '\n').trim();
  }
  const blocks = [...calls, ...declarations.values()];
  const lines = [
    '可导入 ' + runtime.map(name => '`' + name + '`').join('、') + '。', links.join(' · '),
  ];
  if (basicExample) lines.push('<details>\n<summary>完整 TSX 示例</summary>\n\n```tsx\n' + basicExample + '\n```\n\n</details>');
  if (blocks.length) lines.push('<details>\n<summary>字段、回调与数据类型</summary>\n\n```ts\n' + blocks.join('\n\n') + '\n```\n\n</details>');
  return lines.join('\n\n');
}

const original = readFileSync(guide, 'utf8').replace(/\r\n/g, '\n');
const found = new Set();
const updated = original.replace(/<!-- api:([\w-]+) -->[\s\S]*?<!-- \/api -->/g, (_, slug) => {
  if (found.has(slug)) throw new Error('Duplicate section: ' + slug);
  found.add(slug);
  return '<!-- api:' + slug + ' -->\n\n' + refBlock(slug) + '\n\n<!-- /api -->';
});
const missing = [...entryPoints.keys()].filter(slug => !found.has(slug));
if (missing.length) throw new Error('Add usage notes and api markers for: ' + missing.join(', '));
if (process.argv.includes('--check')) {
  if (updated !== original) throw new Error('AI-GUIDE.md is stale. Run node scripts/ai-guide.mjs.');
} else if (updated !== original) {
  writeFileSync(guide, updated);
}
console.log('AI-GUIDE.md: ' + found.size + ' entry points checked.');
