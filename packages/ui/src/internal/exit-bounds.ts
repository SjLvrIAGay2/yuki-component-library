import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useCallback, useRef, useState, type CSSProperties } from 'react';

/** Capture a component's public content ref; exiting visuals never retain its interactive layer. */
export function useExitBounds(open: boolean) {
  const element = useRef<HTMLElement | null>(null);
  const [bounds, setBounds] = useState<CSSProperties>();
  const capture = useCallback(() => {
    const rect = element.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    setBounds((previous) =>
      previous?.left === rect.left &&
      previous?.top === rect.top &&
      previous?.width === rect.width &&
      previous?.height === rect.height
        ? previous
        : {
            position: 'fixed',
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            margin: 0,
            pointerEvents: 'none',
          },
    );
  }, []);
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) capture();
      element.current = node;
      if (node) capture();
    },
    [capture],
  );
  useIsomorphicLayoutEffect(() => {
    if (!open || !element.current) return;
    const observer = new ResizeObserver(capture);
    observer.observe(element.current);
    const frame = requestAnimationFrame(capture);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [open, capture]);
  return { ref, bounds, capture };
}
