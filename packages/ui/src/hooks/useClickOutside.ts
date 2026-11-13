import { useEffect, type RefObject } from 'react';
import { contains } from '../internal/dom';

/**
 * Fire when a pointer interaction happens outside every supplied root.
 * Handles iframes/shadow DOM through composedPath and ignores right-click.
 */
export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  handler: (event: PointerEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: PointerEvent) => {
      if (event.button !== undefined && event.button !== 0) return;
      const targets = refs.map((ref) => ref.current).filter(Boolean) as HTMLElement[];
      const path = event.composedPath?.() ?? [];
      const inside = targets.some(
        (target) => contains(target, event.target as Node) || path.includes(target),
      );
      if (!inside) handler(event);
    };
    document.addEventListener('pointerdown', listener, true);
    return () => document.removeEventListener('pointerdown', listener, true);
  }, [refs, handler, enabled]);
}
