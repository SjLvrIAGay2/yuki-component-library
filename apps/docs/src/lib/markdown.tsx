import { useState, type ReactNode } from 'react';
import { Icon } from '@yuki-ui/react';
import { getExample } from '../lib/examples';
import { headingId } from '../lib/content';
import { ExamplePreview } from '../components/ExamplePreview';
import { CodeSample } from '../components/CodeSample';

/* -------------------------------------------------------------------------- */
/* Inline                                                                     */
/* -------------------------------------------------------------------------- */

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*\n]+\*)/g;

export function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}-i${index++}`;
    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="docs-inline-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const label = link?.[1] ?? token;
      const href = link?.[2] ?? '#';
      nodes.push(
        <a
          key={key}
          href={href}
          className="docs-link"
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = start + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                     */
/* -------------------------------------------------------------------------- */

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };
  return (
    <div className="docs-code">
      <div className="docs-code__bar">
        <span className="docs-code__lang">{lang || 'text'}</span>
        <button type="button" className="docs-code__copy" onClick={copy} aria-label="复制代码">
          <Icon name={copied ? 'check' : 'copy'} size="0.875rem" />
          <span>{copied ? '已复制' : '复制'}</span>
        </button>
      </div>
      <CodeSample code={code} language={lang || 'text'} className="docs-code__pre" />
    </div>
  );
}

function DemoBlock({ id }: { id: string }) {
  const example = getExample(id);
  if (!example) {
    return (
      <div className="docs-demo docs-demo--missing">
        <span>示例尚未生成：</span>
        <code>{id}</code>
      </div>
    );
  }
  return <ExamplePreview key={id} example={example} />;
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        <thead>
          <tr>
            {head.map((cell, i) => (
              <th key={i}>{renderInline(cell, `th${i}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {head.map((_, c) => (
                <td key={c}>{renderInline(row[c] ?? '', `td${r}-${c}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BLOCK_START =
  /^(#{1,4}\s|```|\|.*\||>\s?|[-*]\s|\d+\.\s|<Demo\s|<\/?[A-Za-z][^>]*>|---+\s*$)/;

function isTableDivider(line: string): boolean {
  return /^\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-');
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Fenced code
    if (/^\s*```/.test(line)) {
      const lang = line.trim().replace(/^```/, '').trim();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```/.test(lines[i] ?? '')) {
        code.push(lines[i] ?? '');
        i += 1;
      }
      i += 1;
      blocks.push(<CodeBlock key={key++} code={code.join('\n')} lang={lang} />);
      continue;
    }

    // Demo marker
    const demo = /^<Demo\s+id=["']([^"']+)["']\s*\/?>\s*$/.exec(line.trim());
    if (demo) {
      blocks.push(<DemoBlock key={key++} id={demo[1] ?? ''} />);
      i += 1;
      continue;
    }

    // Headings
    const heading = /^(#{1,4})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const depth = (heading[1] ?? '#').length;
      const text = (heading[2] ?? '').replace(/[`*_~]/g, '');
      const id = headingId(text);
      if (depth <= 1) {
        blocks.push(
          <h2 key={key++} id={id} className="docs-h docs-h--1">
            {renderInline(text, `h${key}`)}
          </h2>,
        );
      } else if (depth === 2) {
        blocks.push(
          <h2 key={key++} id={id} className="docs-h docs-h--2">
            {renderInline(text, `h${key}`)}
          </h2>,
        );
      } else {
        blocks.push(
          <h3 key={key++} id={id} className="docs-h docs-h--3">
            {renderInline(text, `h${key}`)}
          </h3>,
        );
      }
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      blocks.push(<hr key={key++} className="docs-hr" />);
      i += 1;
      continue;
    }

    // Table
    if (line.trim().startsWith('|')) {
      const headerLine = line.trim();
      const divider = (lines[i + 1] ?? '').trim();
      if (isTableDivider(divider)) {
        const parse = (raw: string): string[] =>
          raw
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split(/(?<!\\)\|/)
            .map((cell) => cell.trim().replace(/\\\|/g, '|'));
        const head = parse(headerLine);
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
          rows.push(parse((lines[i] ?? '').trim()));
          i += 1;
        }
        blocks.push(<Table key={key++} head={head} rows={rows} />);
        continue;
      }
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i] ?? '')) {
        quote.push((lines[i] ?? '').replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(
        <blockquote key={key++} className="docs-quote">
          {renderInline(quote.join(' '), `q${key}`)}
        </blockquote>,
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={key++} className="docs-list">
          {items.map((item, index) => (
            <li key={index}>{renderInline(item, `li${key}-${index}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? '')) {
        items.push((lines[i] ?? '').replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={key++} className="docs-list docs-list--ordered">
          {items.map((item, index) => (
            <li key={index}>{renderInline(item, `oli${key}-${index}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    const paragraph: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() &&
      !BLOCK_START.test(lines[i] ?? '')
    ) {
      paragraph.push(lines[i] ?? '');
      i += 1;
    }
    blocks.push(
      <p key={key++} className="docs-p">
        {renderInline(paragraph.join(' '), `p${key}`)}
      </p>,
    );
  }

  return <div className="docs-markdown">{blocks}</div>;
}
