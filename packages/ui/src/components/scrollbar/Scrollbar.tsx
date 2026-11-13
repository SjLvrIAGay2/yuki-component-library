import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type UIEvent as ReactUIEvent,
} from 'react';
import { cx } from '../../internal/cx';
import { useEventCallback } from '../../hooks';

export type ScrollbarDirection = 'vertical' | 'horizontal' | 'both';
export type ScrollbarVisibility = 'always' | 'hover';

export interface ScrollbarClassNames {
  root?: string;
  view?: string;
  track?: string;
  trackX?: string;
  trackY?: string;
  thumb?: string;
  thumbX?: string;
  thumbY?: string;
}

export interface ScrollbarStyles {
  root?: CSSProperties;
  view?: CSSProperties;
  track?: CSSProperties;
  trackX?: CSSProperties;
  trackY?: CSSProperties;
  thumb?: CSSProperties;
  thumbX?: CSSProperties;
  thumbY?: CSSProperties;
}

export interface ScrollbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'> {
  direction?: ScrollbarDirection;
  visibility?: ScrollbarVisibility;
  /** Thickness of the custom scrollbar in px. */
  size?: number;
  /** Make the scroll viewport keyboard focusable (default true). */
  focusable?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  onScroll?: (event: ReactUIEvent<HTMLDivElement>) => void;
  children?: ReactNode;
  classNames?: ScrollbarClassNames;
  styles?: ScrollbarStyles;
}

interface Metrics {
  overflowX: boolean;
  overflowY: boolean;
  xPercent: number;
  yPercent: number;
  xOffset: number;
  yOffset: number;
}

const EMPTY_METRICS: Metrics = {
  overflowX: false,
  overflowY: false,
  xPercent: 0,
  yPercent: 0,
  xOffset: 0,
  yOffset: 0,
};

const percentOf = (value: number, total: number) =>
  total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

/**
 * Scroll container with custom overlay scrollbars. Works with vertical,
 * horizontal or both axes and can reveal the thumbs on hover.
 */
export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(function Scrollbar(
  inputProps,
  ref,
) {
  const {
    direction = 'vertical',
    visibility = 'always',
    size,
    focusable = true,
    maxHeight,
    onScroll,
    children,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Scrollbar', inputProps);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [dragging, setDragging] = useState(false);
  const stopDrag = useRef<() => void>();
  useEffect(() => () => stopDrag.current?.(), []);

  const showX = direction !== 'vertical';
  const showY = direction !== 'horizontal';

  const update = useEventCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    const clientWidth = view.clientWidth;
    const clientHeight = view.clientHeight;
    const scrollWidth = view.scrollWidth;
    const scrollHeight = view.scrollHeight;
    const maxX = scrollWidth - clientWidth;
    const maxY = scrollHeight - clientHeight;
    setMetrics((prev) => {
      const next: Metrics = {
        overflowX: showX && maxX > 1,
        overflowY: showY && maxY > 1,
        xPercent: percentOf(clientWidth, scrollWidth),
        yPercent: percentOf(clientHeight, scrollHeight),
        xOffset: maxX > 0 ? (view.scrollLeft / maxX) * (100 - percentOf(clientWidth, scrollWidth)) : 0,
        yOffset: maxY > 0 ? (view.scrollTop / maxY) * (100 - percentOf(clientHeight, scrollHeight)) : 0,
      };
      if (
        prev.overflowX === next.overflowX &&
        prev.overflowY === next.overflowY &&
        prev.xPercent === next.xPercent &&
        prev.yPercent === next.yPercent &&
        prev.xOffset === next.xOffset &&
        prev.yOffset === next.yOffset
      ) {
        return prev;
      }
      return next;
    });
  });

  useEffect(() => {
    update();
    const view = viewRef.current;
    if (!view || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    const observeChildren = () => {
      observer.disconnect();
      observer.observe(view);
      for (const child of Array.from(view.children)) observer.observe(child);
      update();
    };
    observeChildren();
    const mutations = new MutationObserver(observeChildren);
    mutations.observe(view, { childList: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, [update]);

  const handleScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    update();
    onScroll?.(event);
  };

  const startDrag = (axis: 'x' | 'y') => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const view = viewRef.current;
    if (!view) return;
    event.preventDefault();
    event.stopPropagation();
    stopDrag.current?.();
    setDragging(true);
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = view.scrollLeft;
    const startTop = view.scrollTop;
    const track = (event.currentTarget.parentElement as HTMLElement | null)?.getBoundingClientRect();
    const thumb = event.currentTarget.getBoundingClientRect();
    const travel = axis === 'x' ? (track?.width ?? 0) - thumb.width : (track?.height ?? 0) - thumb.height;
    const maxX = view.scrollWidth - view.clientWidth;
    const maxY = view.scrollHeight - view.clientHeight;

    const handleMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== event.pointerId || travel <= 0) return;
      if (axis === 'x') {
        view.scrollLeft = startLeft + ((moveEvent.clientX - startX) / travel) * maxX;
      }
      if (axis === 'y') {
        view.scrollTop = startTop + ((moveEvent.clientY - startY) / travel) * maxY;
      }
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
    const handleUp = (end: PointerEvent) => {
      if (end.pointerId !== event.pointerId) return;
      cleanup();
      setDragging(false);
      stopDrag.current = undefined;
    };
    stopDrag.current = cleanup;
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  };

  const rootStyle = {
    ...(size !== undefined
      ? ({ '--yuki-scrollbar-size': `${size}px` } as unknown as CSSProperties)
      : null),
    ...styles?.root,
    ...style,
  } as CSSProperties;

  const thumbYStyle: CSSProperties = {
    blockSize: `${metrics.yPercent}%`,
    insetBlockStart: `${metrics.yOffset}%`,
    ...styles?.thumb,
    ...styles?.thumbY,
  };
  const thumbXStyle: CSSProperties = {
    inlineSize: `${metrics.xPercent}%`,
    insetInlineStart: `${metrics.xOffset}%`,
    ...styles?.thumb,
    ...styles?.thumbX,
  };

  return (
    <div
      {...rest}
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cx('yuki-scrollbar', classNames?.root, className)}
      style={rootStyle}
      data-slot="scrollbar"
      data-direction={direction}
      data-visibility={visibility}
      data-dragging={dragging ? 'true' : 'false'}
    >
      <div
        ref={viewRef}
        className={cx('yuki-scrollbar__view', classNames?.view)}
        style={{ maxHeight, ...styles?.view }}
        data-slot="scrollbar-view"
        tabIndex={focusable ? 0 : undefined}
        onScroll={handleScroll}
      >
        {children}
      </div>
      {metrics.overflowY ? (
        <div
          className={cx('yuki-scrollbar__track', 'yuki-scrollbar__track--vertical', classNames?.track, classNames?.trackY)}
          style={{ ...styles?.track, ...styles?.trackY }}
          data-slot="scrollbar-track"
          data-orientation="vertical"
          aria-hidden="true"
        >
          <div
            className={cx('yuki-scrollbar__thumb', 'yuki-scrollbar__thumb--vertical', classNames?.thumb, classNames?.thumbY)}
            style={thumbYStyle}
            data-slot="scrollbar-thumb"
            role="scrollbar"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((metrics.yOffset / Math.max(1, 100 - metrics.yPercent)) * 100)}
            onPointerDown={startDrag('y')}
          />
        </div>
      ) : null}
      {metrics.overflowX ? (
        <div
          className={cx('yuki-scrollbar__track', 'yuki-scrollbar__track--horizontal', classNames?.track, classNames?.trackX)}
          style={{ ...styles?.track, ...styles?.trackX }}
          data-slot="scrollbar-track"
          data-orientation="horizontal"
          aria-hidden="true"
        >
          <div
            className={cx('yuki-scrollbar__thumb', 'yuki-scrollbar__thumb--horizontal', classNames?.thumb, classNames?.thumbX)}
            style={thumbXStyle}
            data-slot="scrollbar-thumb"
            role="scrollbar"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((metrics.xOffset / Math.max(1, 100 - metrics.xPercent)) * 100)}
            onPointerDown={startDrag('x')}
          />
        </div>
      ) : null}
    </div>
  );
});

Scrollbar.displayName = 'Scrollbar';
