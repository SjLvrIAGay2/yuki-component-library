import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { LocaleMessages } from '../locale';
import { useLocale } from '../theme';

export type MediaSource = string | Blob;
export interface MediaMetadata {
  duration: number | null;
  width?: number;
  height?: number;
  src: string;
  mimeType?: string;
  size?: number;
  filename?: string;
}
export interface MediaFailure {
  code: number;
  message: string;
}

export function useMediaSource(source?: MediaSource) {
  const [object, setObject] = useState<{ source: Blob; url: string }>();
  useEffect(() => {
    if (typeof source === 'string' || !source) return;
    const url = URL.createObjectURL(source);
    setObject({ source, url });
    return () => URL.revokeObjectURL(url);
  }, [source]);
  return typeof source === 'string'
    ? source || undefined
    : object?.source === source
      ? object?.url
      : undefined;
}

function childMediaSources(children: ReactNode): [string, string?, string?][] {
  const sources: [string, string?, string?][] = [];
  Children.forEach(children, (child) => {
    if (
      !isValidElement<{ children?: ReactNode; src?: string; type?: string; media?: string }>(child)
    )
      return;
    if (child.type === Fragment) sources.push(...childMediaSources(child.props.children));
    else if (child.type === 'source')
      sources.push([child.props.src ?? '', child.props.type, child.props.media]);
  });
  return sources;
}

/** Scope status to the mounted media element, including native <source> alternatives. */
export function useMediaResource<T extends HTMLMediaElement>(
  source: MediaSource | undefined,
  children: ReactNode,
) {
  const { messages } = useLocale();
  const url = useMediaSource(source);
  const sources = childMediaSources(children);
  const key = JSON.stringify([url ?? null, url ? [] : sources]);
  const [media, setMedia] = useState<T | null>(null);
  const live = useRef<T | null>(null);
  const ref = useCallback((element: T | null) => {
    live.current = element;
    setMedia(element);
  }, []);
  const [metadata, setMetadata] = useState<{ element: T; value: MediaMetadata }>();
  const [failure, setFailure] = useState<{ element: T; value: MediaFailure }>();
  const failedSources = useRef(
    new WeakMap<T, { nodes: Set<HTMLSourceElement>; reported: boolean }>(),
  );
  useEffect(() => {
    if (!media) return;
    const reset = () => {
      if (media !== live.current) return;
      setMetadata(undefined);
      setFailure(undefined);
      failedSources.current.delete(media);
    };
    media.addEventListener('emptied', reset);
    media.addEventListener('loadstart', reset);
    return () => {
      media.removeEventListener('emptied', reset);
      media.removeEventListener('loadstart', reset);
      // Release decoder/network resources on source replacement and unmount.
      queueMicrotask(() => {
        // StrictMode replays effects without detaching the live element.
        if (live.current === media) return;
        media.pause();
        media.removeAttribute('src');
        media.querySelectorAll('source').forEach((child) => child.removeAttribute('src'));
        media.load();
      });
    };
  }, [media]);
  const hasChildSource =
    sources.some(([src]) => !!src) ||
    (!!media &&
      Array.from(media.querySelectorAll('source')).some((child) => !!child.getAttribute('src')));
  const loaded = (element: T) => {
    if (element !== live.current) return;
    const value = readMediaMetadata(element, source);
    setMetadata({ element, value });
    setFailure(undefined);
    failedSources.current.delete(element);
    return value;
  };
  const failed = (element: T) => {
    if (element !== live.current) return;
    const value = mediaFailure(element.error, messages);
    setFailure({ element, value });
    return value;
  };
  const sourceFailed = (element: T, target: EventTarget | null) => {
    if (
      element !== live.current ||
      element.getAttribute('src') ||
      !(target instanceof HTMLSourceElement) ||
      target.parentElement !== element
    )
      return;
    const failures = failedSources.current.get(element) ?? {
      nodes: new Set<HTMLSourceElement>(),
      reported: false,
    };
    if (failures.reported || failures.nodes.has(target)) return;
    failures.nodes.add(target);
    failedSources.current.set(element, failures);
    const candidates = Array.from(element.querySelectorAll('source')).filter(
      (candidate) =>
        !!candidate.getAttribute('src') &&
        (!candidate.media || window.matchMedia(candidate.media).matches),
    );
    if (!candidates.every((candidate) => failures.nodes.has(candidate))) return;
    failures.reported = true;
    const value = mediaFailure(element.error ?? { code: 4 }, messages);
    setFailure({ element, value });
    return value;
  };
  return {
    url,
    key,
    media,
    ref,
    hasSource: !!source || hasChildSource,
    enabled: !!url || hasChildSource,
    metadata: metadata?.element === media ? metadata?.value : undefined,
    failure: failure?.element === media ? failure?.value : undefined,
    loaded,
    failed,
    sourceFailed,
    retry() {
      if (!media || media !== live.current) return;
      setFailure(undefined);
      failedSources.current.delete(media);
      media.load();
    },
  };
}

export function readMediaMetadata(media: HTMLMediaElement, source?: MediaSource): MediaMetadata {
  return {
    duration: Number.isFinite(media.duration) ? media.duration : null,
    ...('videoWidth' in media
      ? {
          width: (media as HTMLVideoElement).videoWidth,
          height: (media as HTMLVideoElement).videoHeight,
        }
      : {}),
    src: media.currentSrc || media.src,
    ...(source && typeof source !== 'string'
      ? {
          mimeType: source.type,
          size: source.size,
          filename: 'name' in source ? String(source.name) : undefined,
        }
      : {}),
  };
}

export function mediaFailure(
  error: Pick<MediaError, 'code'> | null,
  labels?: LocaleMessages,
): MediaFailure {
  const messages: Record<number, string> = {
    1: labels?.mediaAborted ?? '媒体加载已中止。',
    2: labels?.mediaNetwork ?? '无法加载媒体，请检查网络或文件地址。',
    3: labels?.mediaDecode ?? '媒体解码失败，文件可能已损坏。',
    4: labels?.mediaUnsupported ?? '浏览器不支持此媒体格式，或文件不可访问。',
  };
  return {
    code: error?.code ?? 0,
    message: messages[error?.code ?? 0] ?? labels?.mediaFailure ?? '媒体加载失败，请尝试其他文件。',
  };
}

export function formatMediaTime(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return '--:--';
  const value = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(value / 3600);
  return `${hours ? `${hours}:` : ''}${String(Math.floor(value / 60) % 60).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

/** Browser metadata decoding without mounting a player. Does not upload or transcribe media. */
export async function parseMediaMetadata(
  source: MediaSource,
  {
    kind,
    signal,
    timeout = 15_000,
  }: { kind: 'video' | 'audio'; signal?: AbortSignal; timeout?: number },
): Promise<MediaMetadata> {
  if (typeof document === 'undefined') throw new Error('媒体元数据解析需要浏览器环境。');
  signal?.throwIfAborted();
  const element = document.createElement(kind);
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      element.onloadedmetadata = null;
      element.onerror = null;
      element.removeAttribute('src');
      element.load();
      if (typeof source !== 'string') URL.revokeObjectURL(url);
    };
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      const metadata = error ? undefined : readMediaMetadata(element, source);
      cleanup();
      if (error) reject(error);
      else resolve(metadata!);
    };
    const abort = () => finish(new DOMException('解析已取消', 'AbortError'));
    const timer = setTimeout(() => finish(new Error('媒体元数据读取超时。')), Math.max(1, timeout));
    element.preload = 'metadata';
    element.onloadedmetadata = () => finish();
    element.onerror = () => finish(new Error(mediaFailure(element.error).message));
    signal?.addEventListener('abort', abort, { once: true });
    element.src = url;
    element.load();
  });
}
