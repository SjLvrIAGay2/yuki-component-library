import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/** Observe an element's content-box size. */
export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  callback?: (size: ElementSize) => void,
): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.contentBoxSize?.[0];
      const next = box
        ? { width: box.inlineSize, height: box.blockSize }
        : { width: entry.contentRect.width, height: entry.contentRect.height };
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
      callbackRef.current?.(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
