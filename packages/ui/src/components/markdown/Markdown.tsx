import type { WithStyle } from '../../styles/properties';
import { forwardRef, useMemo, type HTMLAttributes, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Element, Root, Text } from 'hast';
import { CodeBlock, type CodeBlockProps } from '../code-block';
import { limitTextLines } from '../../internal/text-preview';
import { cx } from '../../internal/cx';
import { formatMessage } from '../../locale';
import { useComponentDefaults, useLocale } from '../../theme';

function labelTaskItems(label: string) {
  return (tree: Root) => {
    const plainText = (node: Root | Element | Text): string =>
      node.type === 'text'
        ? node.value
        : node.children
            .map((child) =>
              child.type === 'element' || child.type === 'text' ? plainText(child) : '',
            )
            .join('');
    function visit(node: Root | Element) {
      if (node.type === 'element' && node.tagName === 'li') {
        const findCheckbox = (parent: Element): Element | undefined => {
          for (const child of parent.children)
            if (child.type === 'element') {
              if (child.tagName === 'input' && child.properties.type === 'checkbox') return child;
              if (child.tagName === 'p') {
                const match = findCheckbox(child);
                if (match) return match;
              }
            }
        };
        const checkbox = findCheckbox(node);
        if (checkbox) checkbox.properties.ariaLabel = plainText(node).trim() || label;
      }
      for (const child of node.children) if (child.type === 'element') visit(child);
    }
    visit(tree);
  };
}

// Keep complete code nodes for copying; prune the rendered tree instead of the source.
function limitMarkdownLines(limit: number) {
  return () => (tree: Root) => {
    const visit = (parent: Root | Element) => {
      if (parent.type === 'element' && parent.tagName === 'pre') return;
      parent.children = parent.children.filter(
        (child) => (child.position?.start.line ?? 1) <= limit,
      );
      for (const child of parent.children) {
        if (child.type === 'element') visit(child);
        else if (child.type === 'text') {
          child.value = limitTextLines(
            child.value,
            Math.max(1, limit - (child.position?.start.line ?? 1) + 1),
          ).text;
        }
      }
    };
    visit(tree);
  };
}

export interface MarkdownProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
  children: string;
  /** Trusted React component overrides, not HTML strings. */
  components?: Components;
  /** Overrides fenced code blocks without replacing inline code. */
  renderCodeBlock?: (props: CodeBlockProps) => ReactNode;
  maxRenderedLines?: number;
  openLinksInNewTab?: boolean;
  codeLineNumbers?: boolean;
  allowImages?: boolean;
  codeBlockProps?: Omit<CodeBlockProps, 'code' | 'language'>;
  tableScrollProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  truncationMessage?: ReactNode;
}

export const Markdown = forwardRef<HTMLDivElement, MarkdownProps>(function Markdown(input, ref) {
  const {
    children,
    components,
    renderCodeBlock,
    maxRenderedLines,
    openLinksInNewTab = true,
    codeLineNumbers = false,
    allowImages = true,
    codeBlockProps,
    tableScrollProps,
    truncationMessage,
    className,
    ...props
  } = useComponentDefaults('Markdown', input);
  const { locale, messages } = useLocale();
  const taskPlugin = useMemo(() => () => labelTaskItems(messages.taskState), [messages.taskState]);
  const preview = useMemo(
    () => limitTextLines(children.replace(/\r\n?/g, '\n'), maxRenderedLines),
    [children, maxRenderedLines],
  );
  const limitPlugin = useMemo(() => limitMarkdownLines(preview.limit), [preview.limit]);
  const renderers = useMemo<Components>(
    () => ({
      pre({ node, children: codeChildren, ...preProps }) {
        if (components?.code && !renderCodeBlock) return <pre {...preProps}>{codeChildren}</pre>;
        const code = node?.children.find(
          (child) => child.type === 'element' && child.tagName === 'code',
        );
        if (!code || code.type !== 'element') return null;
        const language =
          String(code.properties.className ?? '').match(/language-([\w+-]+)/)?.[1] ?? 'text';
        const text = code.children
          .map((child) => (child.type === 'text' ? child.value : ''))
          .join('')
          .replace(/\n$/, '');
        const codeProps = {
          ...codeBlockProps,
          code: text,
          language,
          showLineNumbers: codeBlockProps?.showLineNumbers ?? codeLineNumbers,
          maxRenderedLines: Math.min(
            Number.isFinite(codeBlockProps?.maxRenderedLines) &&
              codeBlockProps!.maxRenderedLines! >= 1
              ? Math.floor(codeBlockProps!.maxRenderedLines!)
              : Infinity,
            Math.max(1, preview.limit - (node?.position?.start.line ?? 1)),
          ),
        };
        return renderCodeBlock ? renderCodeBlock(codeProps) : <CodeBlock {...codeProps} />;
      },
      a({ node: _node, href, children: linkText, ...linkProps }) {
        const external = !!href && /^(https?:)?\/\//i.test(href);
        return (
          <a
            {...linkProps}
            href={href}
            target={external && openLinksInNewTab ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
          >
            {linkText}
          </a>
        );
      },
      img({ node: _node, ...imageProps }) {
        return allowImages ? (
          <img {...imageProps} alt={imageProps.alt ?? ''} loading="lazy" />
        ) : (
          <span>{imageProps.alt || messages.imageFallback}</span>
        );
      },
      table({ node: _node, ...tableProps }) {
        return (
          <div
            {...tableScrollProps}
            className={cx('yuki-markdown__table-scroll', tableScrollProps?.className)}
            tabIndex={tableScrollProps?.tabIndex ?? 0}
            role={tableScrollProps?.role ?? 'region'}
            aria-label={tableScrollProps?.['aria-label'] ?? messages.markdownTable}
          >
            <table {...tableProps} />
          </div>
        );
      },
      ...components,
    }),
    [
      components,
      renderCodeBlock,
      preview.limit,
      openLinksInNewTab,
      codeLineNumbers,
      allowImages,
      messages.markdownTable,
      messages.imageFallback,
      codeBlockProps,
      tableScrollProps,
    ],
  );
  return (
    <div {...props} ref={ref} data-slot="markdown" className={cx('yuki-markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[limitPlugin, taskPlugin]}
        skipHtml
        components={renderers}
      >
        {children}
      </ReactMarkdown>
      {preview.truncated && truncationMessage !== null && truncationMessage !== false && (
        <p className="yuki-markdown__truncated" role="note">
          {truncationMessage === undefined
            ? formatMessage(messages.markdownLimit, { count: preview.limit.toLocaleString(locale.name) })
            : truncationMessage}
        </p>
      )}
    </div>
  );
});
