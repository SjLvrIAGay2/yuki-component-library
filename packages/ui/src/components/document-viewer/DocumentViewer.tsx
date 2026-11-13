import {
  forwardRef,
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Markdown, type MarkdownProps } from '../markdown';
import { CodeBlock, type CodeBlockProps } from '../code-block';
import { cx } from '../../internal/cx';
import {
  detectDocumentFormat,
  readDocument,
  sourceFilename,
  sourceLanguage,
  DocumentError,
  documentFailure,
  oversizedDocument,
  type DocumentFormat,
  type DocumentLoadInfo,
  type DocumentSource,
} from '../../internal/documents';
import type { PdfOptions } from '../../internal/pdf-preview';
import { RenderBoundary } from '../../internal/render-boundary';
import { DocumentErrorView, type DocumentErrorRenderer } from '../../internal/document-error';
import { notifyCallback } from '../../internal/notify-callback';
import { useComponentDefaults, useLocale } from '../../theme';

const PdfPreview = lazy(() => import('../../internal/pdf-preview'));
export type {
  DocumentFormat,
  DocumentLoadInfo,
  DocumentSource,
  DocumentErrorCode,
} from '../../internal/documents';
export { DocumentError } from '../../internal/documents';
export type { DocumentErrorActions, DocumentErrorRenderer } from '../../internal/document-error';
export type { PdfOptions } from '../../internal/pdf-preview';
export { inferDocumentFormat } from '../../internal/documents';
export interface DocumentViewerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onLoad' | 'onError'
> {
  src?: DocumentSource;
  content?: string;
  format?: DocumentFormat | 'auto';
  filename?: string;
  language?: string;
  maxFileSize?: number;
  maxRenderedLines?: number;
  showHeader?: boolean;
  pdfOptions?: PdfOptions;
  markdownOptions?: Omit<MarkdownProps, 'children'>;
  codeBlockProps?: Omit<CodeBlockProps, 'code' | 'language'>;
  header?: ReactNode;
  headerProps?: HTMLAttributes<HTMLDivElement>;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  renderLoading?: () => ReactNode;
  renderEmpty?: () => ReactNode;
  /** Suspend expensive PDF rendering while a persistent panel is hidden. */
  active?: boolean;
  onLoad?: (info: DocumentLoadInfo) => void;
  onError?: (error: DocumentError) => void;
  renderError?: DocumentErrorRenderer;
}
interface LoadedDocument {
  format: DocumentFormat;
  data: ArrayBuffer;
  text?: string;
  html?: string;
}
export const DocumentViewer = forwardRef<HTMLDivElement, DocumentViewerProps>(
  function DocumentViewer(input, ref) {
    const {
      src,
      content,
      format = 'auto',
      filename: name,
      language,
      maxFileSize: requestedLimit = 20 * 1024 * 1024,
      maxRenderedLines,
      showHeader = true,
      pdfOptions,
      markdownOptions,
      codeBlockProps,
      header,
      headerProps,
      bodyProps,
      renderLoading,
      renderEmpty,
      active = true,
      onLoad,
      onError,
      renderError,
      className,
      ...props
    } = useComponentDefaults('DocumentViewer', input);
    const id = useId();
    const { messages } = useLocale();
    const activeSource = content === undefined ? src : undefined;
    const filename = name ?? sourceFilename(activeSource);
    const maxFileSize =
      Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 20 * 1024 * 1024;
    const [loaded, setLoaded] = useState<LoadedDocument>();
    const [error, setError] = useState<DocumentError>();
    const [retry, setRetry] = useState(0);
    const callbacks = useRef({ onLoad, onError });
    callbacks.current = { onLoad, onError };
    useEffect(() => {
      const controller = new AbortController();
      const { signal } = controller;
      setLoaded(undefined);
      setError(undefined);
      if (!activeSource && content === undefined) return () => controller.abort();
      void (async () => {
        const result =
          content !== undefined
            ? {
                data: new TextEncoder().encode(content).buffer as ArrayBuffer,
                mimeType: 'text/markdown',
              }
            : await readDocument(activeSource!, signal, maxFileSize);
        if (result.data.byteLength > maxFileSize) throw oversizedDocument(maxFileSize);
        const detected =
          format === 'auto' ? detectDocumentFormat(result.data, filename, result.mimeType) : format;
        let document: LoadedDocument = { format: detected, data: result.data };
        let warnings: string[] | undefined;
        if (detected === 'docx') {
          let parseDocx: typeof import('../../internal/parse-docx').parseDocx;
          try {
            ({ parseDocx } = await import('../../internal/parse-docx'));
          } catch (cause) {
            signal.throwIfAborted();
            throw documentFailure(cause);
          }
          try {
            signal.throwIfAborted();
            const word = await parseDocx(result.data, `yuki-${id}-`);
            document = { ...document, text: word.text, html: word.html };
            warnings = word.warnings;
          } catch (cause) {
            signal.throwIfAborted();
            throw documentFailure(cause, 'docx-parse');
          }
        } else if (detected !== 'pdf') {
          try {
            document.text = new TextDecoder('utf-8', { fatal: true }).decode(result.data);
          } catch (cause) {
            throw documentFailure(cause, 'invalid-encoding');
          }
        }
        signal.throwIfAborted();
        setLoaded(document);
        if (detected !== 'pdf')
          notifyCallback(callbacks.current.onLoad, {
            format: detected,
            filename,
            size: result.data.byteLength,
            text: document.text,
            warnings,
          });
      })().catch((cause) => {
        if (signal.aborted) return;
        const failure = documentFailure(cause);
        setError(failure);
        notifyCallback(callbacks.current.onError, failure);
      });
      return () => controller.abort();
    }, [activeSource, content, format, filename, maxFileSize, retry, id]);
    const reload = () => setRetry((value) => value + 1);
    const failPreview = (cause: Error) => {
      const failure = documentFailure(cause);
      setError(failure);
      notifyCallback(callbacks.current.onError, failure);
    };
    return (
      <div
        {...props}
        ref={ref}
        data-slot="document-viewer"
        className={cx('yuki-document-viewer', className)}
        data-active={active}
      >
        {showHeader && (
          <div
            {...headerProps}
            className={cx('yuki-document-viewer__header', headerProps?.className)}
          >
            <span>{header === undefined ? (filename ?? messages.documentTitle) : header}</span>
            <span>
              {loaded?.format.toUpperCase() ?? (format === 'auto' ? 'AUTO' : format.toUpperCase())}
            </span>
          </div>
        )}
        {error ? (
          <DocumentErrorView error={error} retry={reload} renderError={renderError} />
        ) : !activeSource && content === undefined ? (
          renderEmpty ? (
            renderEmpty()
          ) : (
            <p className="yuki-document-viewer__loading">{messages.documentChoose}</p>
          )
        ) : !loaded ? (
          renderLoading ? (
            renderLoading()
          ) : (
            <p className="yuki-document-viewer__loading" role="status">
              {messages.documentReading}
            </p>
          )
        ) : loaded.format === 'pdf' ? (
          active && (
            <RenderBoundary key={retry} onError={failPreview}>
              <Suspense
                fallback={
                  renderLoading ? (
                    renderLoading()
                  ) : (
                    <p className="yuki-document-viewer__loading" role="status">
                      {messages.pdfLoading}
                    </p>
                  )
                }
              >
                <PdfPreview
                  key={retry}
                  data={loaded.data}
                  filename={filename}
                  options={pdfOptions}
                  onLoad={onLoad}
                  onError={failPreview}
                  renderError={renderError}
                  renderLoading={renderLoading}
                />
              </Suspense>
            </RenderBoundary>
          )
        ) : loaded.format === 'markdown' ? (
          <div {...bodyProps} className={cx('yuki-document-viewer__body', bodyProps?.className)}>
            <Markdown
              {...markdownOptions}
              maxRenderedLines={maxRenderedLines ?? markdownOptions?.maxRenderedLines}
            >
              {loaded.text ?? ''}
            </Markdown>
          </div>
        ) : loaded.format === 'docx' ? (
          <div {...bodyProps} className={cx('yuki-document-viewer__body', bodyProps?.className)}>
            <article
              className="yuki-markdown yuki-document-viewer__word"
              aria-label={messages.documentWord}
              onClick={(event) => {
                const link =
                  event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
                const href = link?.getAttribute('href');
                if (!href) return;
                const target = event.currentTarget.ownerDocument.getElementById(href.slice(1));
                if (target && event.currentTarget.contains(target)) {
                  event.preventDefault();
                  target.scrollIntoView({ block: 'nearest' });
                }
              }}
              dangerouslySetInnerHTML={{ __html: loaded.html ?? '' }}
            />
          </div>
        ) : (
          <CodeBlock
            {...codeBlockProps}
            code={loaded.text ?? ''}
            language={loaded.format === 'code' ? (language ?? sourceLanguage(filename)) : 'text'}
            showLineNumbers={codeBlockProps?.showLineNumbers ?? loaded.format === 'code'}
            wrap={codeBlockProps?.wrap ?? loaded.format === 'text'}
            maxRenderedLines={maxRenderedLines ?? codeBlockProps?.maxRenderedLines}
          />
        )}
      </div>
    );
  },
);
