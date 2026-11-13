/* =============================================================================
 * Docs content index
 * -----------------------------------------------------------------------------
 * Every markdown page under src/content is discovered at build time with
 * import.meta.glob — no registry to keep in sync. Frontmatter supports:
 *   title, group, description, order
 * ========================================================================== */

export interface DocHeading {
  depth: 2 | 3;
  text: string;
  id: string;
}

export interface DocPage {
  slug: string;
  title: string;
  group: string;
  description: string;
  order: number;
  body: string;
  headings: DocHeading[];
}

interface RawModule {
  default: string;
}

const modules = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const GROUP_ORDER = ['开始', '基础', '布局', '表单', '数据展示', '内容与媒体', '反馈', '导航', '其他'];

export function headingId(text: string): string {
  const cleaned = text
    .replace(/[`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
  return cleaned || 'section';
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  if (!raw.startsWith('---')) return { meta: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: raw };
  const head = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s*\n/, '');
  const meta: Record<string, string> = {};
  for (const line of head.split('\n')) {
    const match = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!match) continue;
    const key = match[1];
    const value = match[2];
    if (!key || value === undefined) continue;
    meta[key] = value.replace(/^["']|["']$/g, '');
  }
  return { meta, body };
}

function collectHeadings(body: string): DocHeading[] {
  const headings: DocHeading[] = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const marks = match[1] ?? '##';
    const text = (match[2] ?? '').replace(/[`*_~]/g, '').trim();
    headings.push({ depth: marks.length === 2 ? 2 : 3, text, id: headingId(text) });
  }
  return headings;
}

function buildPages(): DocPage[] {
  const pages: DocPage[] = [];
  for (const [path, raw] of Object.entries(modules)) {
    const file = path.split('/').pop() ?? '';
    const slug = file.replace(/\.md$/, '');
    if (!slug) continue;
    const group = path.split('/').slice(-2, -1)[0] ?? '其他';
    const { meta, body } = parseFrontmatter(raw);
    pages.push({
      slug,
      title: meta.title ?? slug,
      group: meta.group ?? group,
      description: meta.description ?? '',
      order: Number(meta.order ?? 999),
      body,
      headings: collectHeadings(body),
    });
  }
  pages.sort((a, b) => {
    const ga = GROUP_ORDER.indexOf(a.group);
    const gb = GROUP_ORDER.indexOf(b.group);
    if (ga !== gb) return (ga === -1 ? 99 : ga) - (gb === -1 ? 99 : gb);
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, 'zh-Hans-CN');
  });
  return pages;
}

export const pages: DocPage[] = buildPages();

export const pageBySlug = new Map(pages.map((page) => [page.slug, page]));

export interface NavGroup {
  title: string;
  items: DocPage[];
}

const groupTitles = [...new Set([...GROUP_ORDER, ...pages.map(page => page.group)])];
export const navGroups: NavGroup[] = groupTitles.reduce<NavGroup[]>((groups, title) => {
  const items = pages.filter((page) => page.group === title);
  if (items.length > 0) groups.push({ title, items });
  return groups;
}, []);

export function findPage(slug: string): DocPage | undefined {
  return pageBySlug.get(slug);
}
