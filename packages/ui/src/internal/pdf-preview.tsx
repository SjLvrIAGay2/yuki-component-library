import type { WithStyle } from '../styles/properties';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  getDocument,
  PDFWorker,
  TextLayer,
  type PDFDocumentProxy,
  type RenderTask,
  type PDFDocumentLoadingTask,
} from 'pdfjs-dist';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { documentFailure, type DocumentError, type DocumentLoadInfo } from './documents';
import { DocumentErrorView, type DocumentErrorRenderer } from './document-error';
import { formatMessage } from '../locale';
import { useLocale } from '../theme';
import { notifyCallback } from './notify-callback';
import { cx } from './cx';
import { mergeProps } from './merge-props';

export interface PdfOptions {
  password?: string;
  cMapUrl?: string;
  standardFontDataUrl?: string;
  wasmUrl?: string;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  showToolbar?: boolean;
  toolbar?: ReactNode;
  toolbarProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  viewportProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  previousButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
  nextButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
  zoomOutButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
  zoomInButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
  resetZoomButtonProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
}
export interface PdfPreviewProps {
  data: ArrayBuffer;
  filename?: string;
  options?: PdfOptions;
  onLoad?: (info: DocumentLoadInfo) => void;
  onError?: (error: DocumentError) => void;
  renderError?: DocumentErrorRenderer;
  renderLoading?: () => ReactNode;
}

function pdfFailure(cause: unknown, phase: 'load' | 'render') {
  const name = cause instanceof Error ? cause.name : '';
  const code =
    name === 'InvalidPDFException' || name === 'MissingPDFException'
      ? 'pdf-parse'
      : phase === 'render'
        ? 'pdf-render'
        : 'preview-unavailable';
  return documentFailure(cause, code);
}

export default function PdfPreview({
  data,
  filename,
  options,
  onLoad,
  onError,
  renderError,
  renderLoading,
}: PdfPreviewProps) {
  const { messages } = useLocale();
  const [document, setDocument] = useState<PDFDocumentProxy>();
  const [localPage, setLocalPage] = useState(options?.defaultPage ?? 1);
  const [localZoom, setLocalZoom] = useState(options?.defaultZoom ?? 1);
  const requestedPage = options?.page ?? localPage;
  const requestedZoom = options?.zoom ?? localZoom;
  const page = Math.min(
    document?.numPages ?? Infinity,
    Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1),
  );
  const zoom = Math.min(2, Math.max(0.5, Number.isFinite(requestedZoom) ? requestedZoom : 1));
  const setPage = (next: number) => {
    if (options?.page === undefined) setLocalPage(next);
    if (next !== page) options?.onPageChange?.(next);
  };
  const setZoom = (next: number) => {
    if (options?.zoom === undefined) setLocalZoom(next);
    if (next !== zoom) options?.onZoomChange?.(next);
  };
  const [error, setError] = useState<DocumentError>();
  const [retry, setRetry] = useState(0);
  const passwordId = useId();
  const [password, setPassword] = useState('');
  const [passwordRequested, setPasswordRequested] = useState(false);
  const unlock = useRef<((password: string) => void) | undefined>(undefined);
  const callbacks = useRef({ onLoad, onError });
  callbacks.current = { onLoad, onError };
  const passwordOption = options?.password;
  const cMapUrl = options?.cMapUrl;
  const standardFontDataUrl = options?.standardFontDataUrl;
  const wasmUrl = options?.wasmUrl;
  useEffect(() => {
    let active = true;
    setDocument(undefined);
    setLocalPage(options?.defaultPage ?? 1);
    setLocalZoom(options?.defaultZoom ?? 1);
    setError(undefined);
    setPassword('');
    setPasswordRequested(false);
    let port: Worker | undefined;
    let worker: PDFWorker | undefined;
    let task: PDFDocumentLoadingTask;
    try {
      port = new Worker(new URL('./pdf-worker.ts', import.meta.url), { type: 'module' });
      worker = PDFWorker.create({ port });
      task = getDocument({
        data: new Uint8Array(data.slice(0)),
        worker,
        password: passwordOption,
        cMapUrl,
        cMapPacked: true,
        standardFontDataUrl,
        wasmUrl,
        useSystemFonts: true,
        enableXfa: false,
        maxImageSize: 16777216,
      });
    } catch (cause) {
      worker?.destroy();
      port?.terminate();
      const failure = pdfFailure(cause, 'load');
      setError(failure);
      notifyCallback(callbacks.current.onError, failure);
      return;
    }
    task.onPassword = (update: (value: string) => void) => {
      if (active) {
        unlock.current = update;
        setPasswordRequested(true);
      }
    };
    void task.promise
      .then((pdf) => {
        if (active) {
          setDocument(pdf);
          setPasswordRequested(false);
          notifyCallback(callbacks.current.onLoad, {
            format: 'pdf',
            filename,
            size: data.byteLength,
            pageCount: pdf.numPages,
          });
        }
      })
      .catch((cause) => {
        if (!active) return;
        const failure = pdfFailure(cause, 'load');
        setError(failure);
        notifyCallback(callbacks.current.onError, failure);
      });
    return () => {
      active = false;
      unlock.current = undefined;
      void task
        .destroy()
        .catch(() => {})
        .finally(() => {
          worker?.destroy();
          port?.terminate();
        });
    };
  }, [data, filename, passwordOption, cMapUrl, standardFontDataUrl, wasmUrl, retry]);
  if (error)
    return (
      <DocumentErrorView
        error={error}
        retry={() => setRetry((value) => value + 1)}
        renderError={renderError}
      />
    );
  if (passwordRequested)
    return (
      <form
        className="yuki-pdf__password"
        onSubmit={(event) => {
          event.preventDefault();
          unlock.current?.(password);
          setPassword('');
        }}
      >
        <label htmlFor={passwordId}>{messages.pdfPassword}</label>
        <Input
          id={passwordId}
          aria-describedby={passwordId + '-hint'}
          type="password"
          required
          autoComplete="off"
          value={password}
          onChange={setPassword}
        />
        <span id={passwordId + '-hint'}>{messages.pdfPasswordHint}</span>
        <Button type="submit">{messages.pdfUnlock}</Button>
      </form>
    );
  if (!document)
    return renderLoading ? (
      renderLoading()
    ) : (
      <p className="yuki-document-viewer__loading" role="status">
        {messages.pdfLoading}
      </p>
    );
  return (
    <div className="yuki-pdf">
      {options?.showToolbar !== false && (
        <div
          {...options?.toolbarProps}
          className={cx('yuki-pdf__toolbar', options?.toolbarProps?.className)}
        >
          <Button
            variant="ghost"
            size="sm"
            aria-label={messages.pdfPrevious}
            {...mergeProps(
              { onClick: () => setPage(page - 1) },
              options?.previousButtonProps ?? {},
            )}
            disabled={page === 1 || options?.previousButtonProps?.disabled}
          >
            {options?.previousButtonProps?.children === undefined
              ? '‹'
              : options.previousButtonProps.children}
          </Button>
          <span aria-live="polite">
            {formatMessage(messages.pdfPageCount, { page, total: document.numPages })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label={messages.pdfNext}
            {...mergeProps({ onClick: () => setPage(page + 1) }, options?.nextButtonProps ?? {})}
            disabled={page === document.numPages || options?.nextButtonProps?.disabled}
          >
            {options?.nextButtonProps?.children === undefined
              ? '›'
              : options.nextButtonProps.children}
          </Button>
          <span className="yuki-pdf__toolbar-spacer" />
          <Button
            variant="ghost"
            size="sm"
            aria-label={messages.pdfZoomOut}
            {...mergeProps(
              { onClick: () => setZoom(Math.max(0.5, zoom - 0.25)) },
              options?.zoomOutButtonProps ?? {},
            )}
            disabled={zoom <= 0.5 || options?.zoomOutButtonProps?.disabled}
          >
            {options?.zoomOutButtonProps?.children === undefined
              ? '−'
              : options.zoomOutButtonProps.children}
          </Button>
          <button
            type="button"
            {...mergeProps({ onClick: () => setZoom(1) }, options?.resetZoomButtonProps ?? {})}
            className={cx('yuki-pdf__zoom', options?.resetZoomButtonProps?.className)}
            aria-label={options?.resetZoomButtonProps?.['aria-label'] ?? messages.pdfResetZoom}
          >
            {options?.resetZoomButtonProps?.children === undefined
              ? `${Math.round(zoom * 100)}%`
              : options.resetZoomButtonProps.children}
          </button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={messages.pdfZoomIn}
            {...mergeProps(
              { onClick: () => setZoom(Math.min(2, zoom + 0.25)) },
              options?.zoomInButtonProps ?? {},
            )}
            disabled={zoom >= 2 || options?.zoomInButtonProps?.disabled}
          >
            {options?.zoomInButtonProps?.children === undefined
              ? '+'
              : options.zoomInButtonProps.children}
          </Button>
          {options?.toolbar}
        </div>
      )}
      <PdfPage
        document={document}
        page={page}
        zoom={zoom}
        viewportProps={options?.viewportProps}
        onError={(failure) => {
          const error = pdfFailure(failure, 'render');
          setError(error);
          notifyCallback(callbacks.current.onError, error);
        }}
      />
    </div>
  );
}

function PdfPage({
  document,
  page,
  zoom,
  onError,
  viewportProps,
}: {
  document: PDFDocumentProxy;
  page: number;
  zoom: number;
  onError: (error: Error) => void;
  viewportProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
}) {
  const { messages } = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next && next > 0) setWidth(next);
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  // Keep page geometry while rendering. Replacing the whole page briefly removes its
  // height, toggles ancestor scrollbars and can feed a resize/render loop.
  return (
    <div
      {...viewportProps}
      className={cx('yuki-pdf__viewport', viewportProps?.className)}
      ref={container}
      tabIndex={viewportProps?.tabIndex ?? 0}
      role={viewportProps?.role ?? 'region'}
      aria-label={viewportProps?.['aria-label'] ?? formatMessage(messages.pdfPage, { page })}
    >
      <PdfCanvas document={document} page={page} width={width} zoom={zoom} onError={onError} />
    </div>
  );
}
function PdfCanvas({
  document,
  page,
  width,
  zoom,
  onError,
}: {
  document: PDFDocumentProxy;
  page: number;
  width: number;
  zoom: number;
  onError: (error: Error) => void;
}) {
  const { messages } = useLocale();
  const canvas = useRef<HTMLCanvasElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1, scale: 1 });
  const [rendered, setRendered] = useState(false);
  const failure = useRef(onError);
  failure.current = onError;
  useEffect(() => {
    let active = true;
    setRendered(false);
    let renderTask: RenderTask | undefined;
    let textLayer: TextLayer | undefined;
    void (async () => {
      const pdfPage = await document.getPage(page);
      if (!active || !canvas.current || !text.current) return;
      const natural = pdfPage.getViewport({ scale: 1 });
      if (
        !Number.isFinite(natural.width) ||
        !Number.isFinite(natural.height) ||
        natural.width <= 0 ||
        natural.height <= 0
      ) {
        throw new Error('无效 PDF 页面尺寸');
      }
      const viewport = pdfPage.getViewport({
        scale: Math.min(Math.max(1, width) / natural.width, 1.5) * zoom,
      });
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        2,
        4096 / Math.max(viewport.width, viewport.height),
      );
      const surface = canvas.current;
      surface.width = Math.ceil(viewport.width * ratio);
      surface.height = Math.ceil(viewport.height * ratio);
      surface.style.width = `${viewport.width}px`;
      surface.style.height = `${viewport.height}px`;
      setSize({ width: viewport.width, height: viewport.height, scale: viewport.scale });
      renderTask = pdfPage.render({
        canvas: surface,
        viewport,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      await renderTask.promise;
      if (!active) return;
      const textContent = await pdfPage.getTextContent();
      if (!active || !text.current) return;
      textLayer = new TextLayer({
        textContentSource: textContent,
        container: text.current,
        viewport,
      });
      await textLayer.render();
      if (active) setRendered(true);
    })().catch((cause) => {
      if (
        active &&
        cause?.name !== 'RenderingCancelledException' &&
        cause?.name !== 'AbortException'
      )
        failure.current(cause instanceof Error ? cause : new Error('PDF 页面绘制失败。'));
    });
    return () => {
      active = false;
      renderTask?.cancel();
      textLayer?.cancel();
    };
  }, [document, page, width, zoom]);
  return (
    <>
      <div
        className="yuki-pdf__page"
        style={
          {
            width: size.width,
            height: size.height,
            '--total-scale-factor': size.scale,
          } as CSSProperties
        }
        data-rendered={rendered}
      >
        <canvas key={`canvas-${page}-${width}-${zoom}`} ref={canvas} aria-hidden="true" />
        <div key={`text-${page}-${width}-${zoom}`} ref={text} className="yuki-pdf__text" />
      </div>
      <span className={rendered ? 'yuki-visually-hidden' : 'yuki-document-viewer__loading'} role="status">
        {rendered ? formatMessage(messages.pdfRendered, { page }) : messages.pdfRendering}
      </span>
    </>
  );
}
