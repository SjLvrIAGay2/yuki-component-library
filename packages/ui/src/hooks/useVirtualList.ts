import { useCallback, useState, type RefObject } from 'react';
import { useIsomorphicLayoutEffect } from '../internal/useIsomorphicLayoutEffect';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  end: number;
}

export interface UseVirtualListOptions {
  count: number;
  itemSize: number;
  overscan?: number;
  /** The scrollable viewport. */
  scrollRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
}

export interface UseVirtualListResult {
  virtualItems: VirtualItem[];
  totalSize: number;
  /** First and last rendered index (inclusive). */
  range: { start: number; end: number };
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto' | 'nearest') => void;
  scrollToOffset: (offset: number) => void;
}

/**
 * Fixed-size row virtualiser used by Table (virtual scroll), List and long
 * Select lists. Rows are expected to share one token-derived height.
 */
export function useVirtualList(options: UseVirtualListOptions): UseVirtualListResult {
  const { scrollRef, enabled = true } = options;
  const count = Number.isFinite(options.count) ? Math.max(0, Math.floor(options.count)) : 0;
  const itemSize = Number.isFinite(options.itemSize) && options.itemSize > 0 ? options.itemSize : 1;
  const overscan = Number.isFinite(options.overscan) ? Math.max(0, Math.floor(options.overscan!)) : 6;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const readViewport = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setScrollTop(element.scrollTop);
    setViewportHeight(element.clientHeight);
  }, [scrollRef]);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    const element = scrollRef.current;
    if (!element) return;
    readViewport();
    let raf: number | null = null;
    const onScroll = () => {
      if (raf !== null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        readViewport();
      });
    };
    element.addEventListener('scroll', onScroll, { passive: true });
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(readViewport) : null;
    observer?.observe(element);
    return () => {
      element.removeEventListener('scroll', onScroll);
      observer?.disconnect();
      if (raf !== null) window.cancelAnimationFrame(raf);
    };
  }, [enabled, readViewport, scrollRef]);

  const totalSize = count * itemSize;
  const viewport = Math.max(viewportHeight, itemSize);
  const top = Math.min(scrollTop, Math.max(0, totalSize - viewport));
  const start = enabled ? Math.max(0, Math.floor(top / itemSize) - overscan) : 0;
  const end = enabled ? Math.min(count - 1, Math.ceil((top + viewport) / itemSize) + overscan - 1) : count - 1;
  const virtualItems: VirtualItem[] = [];
  for (let index = start; index <= end; index++) {
    virtualItems.push({ index, start: index * itemSize, size: itemSize, end: (index + 1) * itemSize });
  }

  const scrollToOffset = useCallback(
    (offset: number) => {
      scrollRef.current?.scrollTo?.({ top: offset });
    },
    [scrollRef],
  );

  const scrollToIndex = useCallback<UseVirtualListResult['scrollToIndex']>(
    (index, align = 'auto') => {
      const element = scrollRef.current;
      if (!element) return;
      const itemStart = index * itemSize;
      const itemEnd = itemStart + itemSize;
      let next = element.scrollTop;
      if (align === 'start') next = itemStart;
      else if (align === 'center') next = itemStart - element.clientHeight / 2 + itemSize / 2;
      else if (align === 'end') next = itemEnd - element.clientHeight;
      else if (align === 'auto' || align === 'nearest') {
        if (itemStart < element.scrollTop) next = itemStart;
        else if (itemEnd > element.scrollTop + element.clientHeight) {
          next = itemEnd - element.clientHeight;
        }
      }
      element.scrollTo?.({ top: Math.max(0, next) });
    },
    [itemSize, scrollRef],
  );

  return {
    virtualItems,
    totalSize,
    range: { start, end },
    scrollToIndex,
    scrollToOffset,
  };
}
