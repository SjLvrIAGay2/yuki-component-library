import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { highlightCode } from '../../internal/code-syntax';
import { limitTextLines } from '../../internal/text-preview';
import type { Element, Root, Text } from 'hast';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import { Button } from '../button';
import { formatMessage } from '../../locale';
import { useComponentDefaults, useLocale } from '../../theme';
import { mergeProps } from '../../internal/merge-props';

interface Segment {
  value: string;
  className: string;
}

/** Walk a syntax tree as text and spans; code is never interpreted as HTML or executed. */
function linesFromTree(tree: Root): Segment[][] {
  const lines: Segment[][] = [[]];
  function walk(node: Root | Element | Text, classes: string[] = []) {
    if (node.type === 'text') {
      node.value.split('\n').forEach((value, index) => {
        if (index) lines.push([]);
        if (value) lines[lines.length - 1]!.push({ value, className: classes.join(' ') });
      });
    } else {
      const next =
        node.type === 'element'
          ? [...classes, ...((node.properties.className ?? []) as string[])]
          : classes;
      for (const child of node.children)
        if (child.type === 'element' || child.type === 'text') walk(child, next);
    }
  }
  walk(tree);
  return lines;
}

export interface CodeBlockProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onCopy'
> {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  startLine?: number;
  highlightLines?: readonly number[];
  wrap?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  /** Limits preview DOM; copying still uses the complete original code. Defaults to 10,000. */
  maxRenderedLines?: number;
  copyable?: boolean;
  onCopy?: (code: string) => void;
  onCopyError?: (error: Error) => void;
  showToolbar?: boolean;
  /** Additional toolbar content; the default label and copy action remain available. */
  toolbar?: ReactNode;
  toolbarProps?: HTMLAttributes<HTMLDivElement>;
  viewportProps?: HTMLAttributes<HTMLPreElement>;
  copyButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  truncationMessage?: ReactNode;
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(input, ref) {
  const {
    code,
    language = 'text',
    filename,
    showLineNumbers = true,
    startLine = 1,
    highlightLines = [],
    wrap = false,
    maxHeight = 480,
    maxRenderedLines,
    copyable = true,
    onCopy,
    onCopyError,
    showToolbar = true,
    toolbar,
    toolbarProps,
    viewportProps,
    copyButtonProps,
    truncationMessage,
    className,
    ...props
  } = useComponentDefaults('CodeBlock', input);
  const { locale, messages } = useLocale();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const operation = useRef(0);
  const currentCode = useRef(code);
  currentCode.current = code;
  useEffect(() => {
    operation.current++;
    clearTimeout(timer.current);
    setCopyState('idle');
    return () => {
      operation.current++;
      clearTimeout(timer.current);
    };
  }, [code]);
  const normalized = code.replace(/\r\n?/g, '\n');
  const preview = useMemo(
    () => limitTextLines(normalized, maxRenderedLines),
    [normalized, maxRenderedLines],
  );
  const lines = useMemo(() => {
    // Large inputs remain readable without running an expensive synchronous grammar pass.
    try {
      const tree = highlightCode(preview.text, language);
      if (tree) return linesFromTree(tree);
    } catch {
      // Malformed or unsupported grammar output still leaves the original source readable.
    }
    return preview.text.split('\n').map((value) => [{ value, className: '' }]);
  }, [preview.text, language]);
  const firstLine = Number.isFinite(startLine) ? Math.max(1, Math.floor(startLine)) : 1;
  const copy = async () => {
    const request = ++operation.current;
    const isCurrent = () => request === operation.current && currentCode.current === code;
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      if (!isCurrent()) return;
      setCopyState('copied');
    } catch (cause) {
      if (!isCurrent()) return;
      const error = cause instanceof Error ? cause : new Error('复制失败，请手动选择代码。');
      setCopyState('error');
      onCopyError?.(error);
      return;
    } finally {
      if (isCurrent()) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          if (isCurrent()) setCopyState('idle');
        }, 2500);
      }
    }
    onCopy?.(code);
  };
  return (
    <div
      {...props}
      ref={ref}
      data-slot="code-block"
      className={cx('yuki-code-block', wrap && 'yuki-code-block--wrap', className)}
    >
      {showToolbar && (
        <div {...toolbarProps} className={cx('yuki-code-block__toolbar', toolbarProps?.className)}>
          <span>{filename ?? language}</span>
          {filename && <span className="yuki-code-block__language">{language}</span>}
          {copyable && (
            <Button
              size="sm"
              tone="neutral"
              variant="ghost"
              {...mergeProps(
                { type: 'button' as const, onClick: copy, 'aria-label': messages.copyCode },
                copyButtonProps ?? {},
              )}
            >
              {copyButtonProps?.children !== undefined ? (
                copyButtonProps.children
              ) : (
                <>
                  {copyState === 'copied' && <Icon name="check" />}
                  {copyState === 'copied'
                    ? messages.copied
                    : copyState === 'error'
                      ? messages.copyFailed
                      : messages.copyCode}
                </>
              )}
            </Button>
          )}
          {toolbar}
        </div>
      )}
      <pre
        {...viewportProps}
        className={cx('yuki-code-block__pre', viewportProps?.className)}
        tabIndex={viewportProps?.tabIndex ?? 0}
        aria-label={
          viewportProps?.['aria-label'] ??
          formatMessage(messages.codeLabel, { name: filename ?? language })
        }
        style={{ maxHeight, ...viewportProps?.style }}
      >
        <code>
          {lines.map((segments, index) => (
            <span
              className="yuki-code-block__line"
              data-highlighted={highlightLines.includes(firstLine + index) || undefined}
              key={index}
            >
              {showLineNumbers && (
                <span className="yuki-code-block__number" aria-hidden="true">
                  {firstLine + index}
                </span>
              )}
              <span className="yuki-code-block__text">
                {segments.map((segment, part) => (
                  <span className={segment.className || undefined} key={part}>
                    {segment.value}
                  </span>
                ))}
                {index < lines.length - 1 ? '\n' : ''}
              </span>
            </span>
          ))}
        </code>
      </pre>
      {preview.truncated && truncationMessage !== null && truncationMessage !== false && (
        <p className="yuki-code-block__truncated" role="note">
          {truncationMessage === undefined
            ? formatMessage(messages.renderLimit, { count: preview.limit.toLocaleString(locale.name) })
            : truncationMessage}
        </p>
      )}
      <span role="status" className="yuki-visually-hidden">
        {copyState === 'copied'
          ? messages.copySuccessStatus
          : copyState === 'error'
            ? messages.copyErrorStatus
            : ''}
      </span>
    </div>
  );
});
