import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

/** Reference-counted body scroll lock for overlays. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;
    const body = document.body;
    if (lockCount === 0) {
      originalOverflow = body.style.overflow;
      originalPaddingRight = body.style.paddingRight;
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (scrollbar > 0) {
        const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${current + scrollbar}px`;
      }
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [active]);
}
