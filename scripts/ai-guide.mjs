/**
 * Sync the inventory, recipes, documented defaults, accessibility notes,
 * examples and public types. The guide owns task selection and usage contracts.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { advancedExamples, docFacts, embeddedExample, readText, sourceLink, syncRecipes, usageDetails } from './ai-guide-docs.mjs';

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

const resolveAlias = symbol => symbol?.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
const symbolOf = node => resolveAlias(checker.getSymbolAtLocation(node));
const publicNames = new Set();
for (const path of entryPoints.values()) {
  const entry = program.getSourceFile(join(source, path, 'index.ts'));
  for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(entry))) {
    publicNames.add(resolveAlias(symbol));
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
    const mapValue = name.endsWith('Styles') ? 'StyleProperties' : 'string';
    if (!declaration.heritageClauses?.length && !index && /(ClassNames|Styles)$/.test(name) && members.every(member =>
      member.questionToken && member.type?.getText() === mapValue)) {
      const keys = members.map(member => "'" + member.name.getText() + "'").join(' | ') || 'never';
      return 'type ' + name + ' = Partial<Record<' + keys + ', ' + mapValue + '>>;';
    }
    if (members.length < declaration.members.length) {
      return head + ' {\n' + members.map(member => '    ' + print(member)).join('\n') + '\n}';
    }
  }
  return print(declaration);
}

function refBlock(slug, groupLink, notes) {
  const path = entryPoints.get(slug);
  if (!path) throw new Error('Unknown reference section: ' + slug);
  const entry = program.getSourceFile(join(source, path, 'index.ts'));
  const symbols = checker.getExportsOfModule(checker.getSymbolAtLocation(entry));
  const runtime = [];
  const typeNames = [];
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
    const symbol = resolveAlias(exported);
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
    typeNames.push(exported.name);
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
  const links = ['所属分组 ' + groupLink, sourceLink('类型与导出入口', relative(root, entry.fileName).replaceAll('\\', '/'))];
  const page = docPath(slug === 'theme' ? 'config-provider' : slug);
  if (!page && !['locale', 'hooks'].includes(slug)) throw new Error('Missing docs page for: ' + slug);
  if (page) links.push(sourceLink('交互与定制', page));
  const content = page ? readText(join(root, page)) : '';
  const facts = docFacts(content);
  const description = [notes, ...facts].join('\n');
  if (!/^\*\*默认(?:值|行为)\*\*\s+[^\s*<#]/m.test(description)) throw new Error('Missing default behavior in API ' + slug);
  if (!/^\*\*无障碍\*\*\s+[^\s*<#]/m.test(description)) throw new Error('Missing accessibility notes in API ' + slug);
  const contract = notes.match(/^\*\*联动\*\*[^\n]+/m)?.[0] ?? '';
  if (![...contract.matchAll(/\]\(#api-([\w-]+)\)/g)].some(match => match[1] !== slug)) {
    throw new Error('Missing related component in API ' + slug);
  }
  const examples = slug === 'theme' ? 'config-provider' : slug;
  const examplesPath = 'apps/docs/src/examples/' + examples + '/';
  const examplesDir = join(root, examplesPath);
  const exampleBlocks = [];
  if (ts.sys.directoryExists(examplesDir)) {
    const files = readdirSync(examplesDir).filter(file => file.endsWith('.tsx')).sort();
    if (files.length) {
      exampleBlocks.push('仓库示例 ' + files.map(file => sourceLink(file, examplesPath + file)).join(' · '));
      exampleBlocks.push(embeddedExample(root, examplesPath + files[0], '完整 TSX 示例'));
      const extra = advancedExamples[slug];
      if (extra) exampleBlocks.push(embeddedExample(root, examplesPath + extra[0] + '.tsx', extra[1]));
    }
  }
  const blocks = [...calls, ...declarations.values()];
  const lines = [...facts, links.join(' · '), '可导入 ' + runtime.map(name => '`' + name + '`').join('、') + '。'];
  if (typeNames.length) lines.push('公开类型 ' + typeNames.map(name => '`' + name + '`').join('、') + '。');
  lines.push(...exampleBlocks);
  const details = usageDetails(content);
  if (details) lines.push(details);
  if (blocks.length) lines.push('<details>\n<summary>字段、回调与数据类型</summary>\n\n```ts\n' + blocks.join('\n\n') + '\n```\n\n</details>');
  return { runtime, typeNames, markdown: lines.join('\n\n') };
}

const original = readFileSync(guide, 'utf8').replace(/\r\n/g, '\n');
const catalog = original.match(/^## 按需求查用法\n([\s\S]*?)(?=^## )/m);
if (!catalog) throw new Error('Missing task index in AI-GUIDE.md');
const groups = new Map();
const groupByEntry = new Map();
let group;
for (const match of catalog[1].matchAll(/^### (.+)$|^\| \[[^\]\n]+\]\(#api-([\w-]+)\) \| .+ \|$/gm)) {
  if (match[1]) {
    group = match[1];
    if (groups.has(group)) throw new Error('Duplicate task group: ' + group);
    groups.set(group, []);
  } else {
    const slug = match[2];
    if (!group || !entryPoints.has(slug)) throw new Error('Invalid task index entry: ' + slug);
    if (groupByEntry.has(slug)) throw new Error('Duplicate task index entry: ' + slug);
    groups.get(group).push(slug);
    groupByEntry.set(slug, group);
  }
}

const groupLink = name => '[' + name + '](#' + name.toLowerCase().replaceAll(' ', '-') + ')';
const runtimeByEntry = new Map();
const listedTypes = new Set();
const sections = /^### API ([\w-]+)$|^<!-- api:([\w-]+) -->[\s\S]*?^<!-- \/api -->$/gm;
let pendingHeading;
let notesStart;
const references = original.replace(sections, (text, heading, slug, offset) => {
  if (heading) {
    if (pendingHeading) throw new Error('Missing API block for: ' + pendingHeading);
    pendingHeading = heading;
    notesStart = offset + text.length;
    return text;
  }
  if (pendingHeading !== slug) throw new Error('Expected a matching API heading before: ' + slug);
  pendingHeading = undefined;
  if (!groupByEntry.has(slug)) throw new Error('Add a task index row for: ' + slug);
  if (runtimeByEntry.has(slug)) throw new Error('Duplicate section: ' + slug);
  const block = refBlock(slug, groupLink(groupByEntry.get(slug)), original.slice(notesStart, offset));
  runtimeByEntry.set(slug, block.runtime);
  for (const name of block.typeNames) listedTypes.add(name);
  return '<!-- api:' + slug + ' -->\n\n' + block.markdown + '\n\n<!-- /api -->';
});
if (pendingHeading) throw new Error('Missing API block for: ' + pendingHeading);
const missing = [...entryPoints.keys()].filter(slug => !runtimeByEntry.has(slug));
if (missing.length) throw new Error('Add a task index row and an API section for: ' + missing.join(', '));
const rootModule = checker.getSymbolAtLocation(program.getSourceFile(join(source, 'index.ts')));
const rootExports = checker.getExportsOfModule(rootModule);
const rootNames = new Set(rootExports
  .filter(symbol => resolveAlias(symbol).flags & ts.SymbolFlags.Value)
  .map(symbol => symbol.name));
const listedNames = new Set([...runtimeByEntry.values()].flat());
const allNames = new Set([...rootNames, ...listedNames]);
const unmatched = [...allNames].filter(name => rootNames.has(name) !== listedNames.has(name));
if (unmatched.length) throw new Error('Guide inventory differs from package root exports: ' + unmatched.join(', '));
const missingTypes = rootExports.filter(symbol => !(resolveAlias(symbol).flags & ts.SymbolFlags.Value) && !listedTypes.has(symbol.name));
if (missingTypes.length) throw new Error('Missing public types: ' + missingTypes.map(symbol => symbol.name).join(', '));

const componentCount = [...entryPoints.values()].filter(path => path.startsWith('components/')).length;
const { version } = JSON.parse(readText(join(root, 'packages/ui/package.json')));
const inventory = [
  '## 全库速览',
  '',
  '`@yuki-ui/react@' + version + '` 提供 ' + componentCount + ' 个组件目录，另含主题、语言、动效和公共 Hooks。点需求方向查看用法，点导出名可直达默认行为、示例和类型。',
  '',
  '| 需求方向 | 组件、组合部件、Hooks 与工具 |',
  '| --- | --- |',
];
// Prefer an export's namesake entry when two barrels expose it (e.g. RadioGroup).
const primaryEntry = new Map();
for (const [slug, names] of runtimeByEntry) {
  for (const name of names) {
    const namesake = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    if (!primaryEntry.has(name) || slug === namesake) primaryEntry.set(name, slug);
  }
}
for (const [name, slugs] of groups) {
  const families = slugs.flatMap(slug => {
    const names = runtimeByEntry.get(slug).filter(symbol => primaryEntry.get(symbol) === slug);
    return names.length ? ['[' + names.join('、') + '](#api-' + slug + ')'] : [];
  });
  inventory.push('| ' + groupLink(name) + ' | ' + families.join(' · ') + ' |');
}
const overview = /^<!-- overview -->\n[\s\S]*?^<!-- \/overview -->$/m;
if (!overview.test(references)) throw new Error('Missing opening inventory markers in AI-GUIDE.md');
const letters = new Map();
for (const slug of [...entryPoints.keys()].sort()) {
  const letter = slug[0].toUpperCase();
  if (!letters.has(letter)) letters.set(letter, []);
  letters.get(letter).push('[' + slug + '](#api-' + slug + ')');
}
const alphabet = /^<!-- alphabet -->[\s\S]*?^<!-- \/alphabet -->$/m;
if (!alphabet.test(references)) throw new Error('Missing alphabetical index markers');
const alphabeticalIndex = [...letters].map(([letter, links]) => '| ' + letter + ' | ' + links.join(' · ') + ' |');
const updated = syncRecipes(root, references
  .replace(overview, () => '<!-- overview -->\n\n' + inventory.join('\n') + '\n\n<!-- /overview -->')
  .replace(alphabet, () => ['<!-- alphabet -->', '', '| 首字母 | API 入口 |', '| --- | --- |',
    ...alphabeticalIndex, '', '<!-- /alphabet -->'].join('\n')));
if (process.argv.includes('--check')) {
  if (updated !== original) throw new Error('AI-GUIDE.md is stale. Run node scripts/ai-guide.mjs.');
  const { checkGuide } = await import('./check-ai-guide.mjs');
  checkGuide(root, updated);
} else if (updated !== original) {
  writeFileSync(guide, updated);
}
console.log('AI-GUIDE.md: ' + runtimeByEntry.size + ' entry points in ' + groups.size + ' task groups checked.');
