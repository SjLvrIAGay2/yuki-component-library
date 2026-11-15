import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const repoFiles = 'https://github.com/SjLvrIAGay2/yuki-component-library/blob/main/';
export const readText = file => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
export const sourceLink = (label, path) => '[' + label + '](' + repoFiles + path + ')';

function section(page, title) {
  return page.split(/^## /m).find(part => part.startsWith(title + '\n'))?.slice(title.length).trim() ?? '';
}

function tableCells(line) {
  return line.trim().slice(1, -1).split(/(?<!\\)\|/).map(cell => cell.trim().replaceAll('\\|', '|'));
}

// Some existing type cells contain unescaped union bars. The default is either
// the last cell or in an explicitly headed column before the description.
function defaultsByScope(page) {
  const groups = [];
  let scope = '';
  let headers = [];
  let rows = [];
  for (const line of section(page, 'API').split('\n')) {
    if (line.startsWith('### ')) scope = line.slice(4).trim();
    if (!line.startsWith('|')) { headers = []; continue; }
    const cells = tableCells(line);
    if (!headers.length) {
      headers = cells;
      rows = [];
      groups.push({ scope, rows });
      continue;
    }
    const column = headers.indexOf('默认值');
    if (column < 0 || cells[0].startsWith('---')) continue;
    const value = column === headers.length - 1 ? cells.at(-1) : cells[column];
    if (value && !/^[-—–]+$/.test(value)) {
      const field = cells[0].replaceAll('`', '');
      rows.push('`' + field + '` ' + value);
    }
  }
  return groups.filter(group => group.rows.length).map(({ scope, rows }) =>
    (scope ? '`' + scope + '`　' : '') + rows.join(' · '));
}

export function docFacts(page) {
  const defaults = defaultsByScope(page);
  const accessibility = section(page, '无障碍').replace(/^<Demo [^\n]*\/>\s*$/gm, '').trim();
  const blocks = [];
  if (defaults.length) blocks.push('**默认值**\n\n' + defaults.map(line => '- ' + line).join('\n'));
  if (accessibility) blocks.push('**无障碍**\n\n' + accessibility);
  return blocks;
}

export function usageDetails(page) {
  const customization = section(page, '定制点').replace(/^<Demo [^\n]*\/>\s*$/gm, '').trim();
  if (!customization) return '';
  // Prefer the documented interactions and combinations over repeating slot lists
  // already present in the public types. Newer pages use short prose paragraphs.
  const behavior = customization.split('\n').filter(line => /^- \*\*(行为|组合)\*\*/.test(line));
  const notes = behavior.length ? behavior.join('\n') : customization.split('\n\n')[0];
  return '<details>\n<summary>定制与交互</summary>\n\n' + notes + '\n\n</details>';
}

export const advancedExamples = {
  drawer: ['03-retained-form', '关闭后保留表单'],
  dropdown: ['03-composition', '组合式菜单与选择回调'],
  select: ['03-multiple', '多选与清空'],
  table: ['03-virtual', '固定列与虚拟滚动'],
  tabs: ['03-composition', '切换面板后保留草稿'],
  theme: ['03-defaults', '子树的组件默认属性'],
  upload: ['03-batch', '整批选择附件'],
};

export function embeddedExample(root, path, label) {
  const code = readText(join(root, path)).trimEnd();
  return '<details>\n<summary>' + label + '</summary>\n\n```tsx\n' + code + '\n```\n\n</details>';
}

export function syncRecipes(root, markdown) {
  const pagePath = 'apps/docs/src/content/开始/recipes.md';
  const page = readText(join(root, pagePath));
  const dir = 'apps/docs/src/examples/recipes';
  const pending = new Set(readdirSync(join(root, dir)).filter(name => name.endsWith('.tsx')));
  const updated = markdown.replace(/^<!-- recipe:([\w-]+) -->[\s\S]*?^<!-- \/recipe -->$/gm, (_, id) => {
    const path = dir + '/' + id + '.tsx';
    if (!pending.delete(id + '.tsx')) throw new Error('Missing or duplicate recipe: ' + id);
    const demo = '<Demo id="recipes/' + id + '" />';
    const entry = page.split(/^## /m).find(part => part.includes(demo));
    if (!entry) throw new Error('Missing recipe introduction in ' + pagePath + ': ' + id);
    const intro = entry.slice(entry.indexOf('\n') + 1, entry.indexOf(demo)).trim();
    if (!intro) throw new Error('Empty recipe introduction: ' + id);
    return ['<!-- recipe:' + id + ' -->', intro + ' ' + sourceLink('示例源码', path),
      '```tsx\n' + readText(join(root, path)).trimEnd() + '\n```', '<!-- /recipe -->'].join('\n\n');
  });
  if (pending.size) throw new Error('Add guide entries for recipes: ' + [...pending].join(', '));
  return updated;
}
