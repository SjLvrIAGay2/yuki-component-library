import { Button, Divider, Icon } from '@yuki-ui/react';
import type { DocPage } from '../lib/content';
import { Markdown } from '../lib/markdown';

export interface ComponentPageProps {
  doc: DocPage;
  onNavigate: (hash: string) => void;
  prev?: DocPage;
  next?: DocPage;
}

export function ComponentPage({ doc, onNavigate, prev, next }: ComponentPageProps) {
  return (
    <article className="docs-article">
      <header className="docs-article__head">
        <div className="docs-article__meta">
          <span className="docs-chip docs-chip--primary">{doc.group}</span>
          <code className="docs-article__slug">components/{doc.slug}</code>
        </div>
        <h1 className="docs-article__title">{doc.title}</h1>
        {doc.description ? <p className="docs-article__desc">{doc.description}</p> : null}
      </header>

      {doc.headings.length > 0 ? (
        <nav className="docs-toc" aria-label="本页目录">
          <span className="docs-toc__title">本页内容</span>
          <ul>
            {doc.headings.map((heading) => (
              <li key={heading.id} className={heading.depth === 3 ? 'docs-toc__item--sub' : undefined}>
                <a href={`#/c/${encodeURIComponent(doc.slug)}?section=${encodeURIComponent(heading.id)}`}>{heading.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <Markdown source={doc.body} />

      <Divider className="docs-article__divider" />

      <footer className="docs-page-nav">
        {prev ? (
          <Button
            variant="ghost"
            startIcon={<Icon name="arrow-left" />}
            onClick={() => onNavigate(`#/c/${prev.slug}`)}
          >
            {prev.title}
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button
            variant="ghost"
            endIcon={<Icon name="arrow-right" />}
            onClick={() => onNavigate(`#/c/${next.slug}`)}
          >
            {next.title}
          </Button>
        ) : (
          <span />
        )}
      </footer>
    </article>
  );
}
