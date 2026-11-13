import { useEffect, type RefObject } from 'react';
import { getFocusableElements } from '../internal/dom';

export interface UseFocusTrapOptions {
  /** Trap is active only when true (usually while the dialog is mounted). */
  active: boolean;
  /** Element focused on activation. Defaults to the first tabbable element. */
  initialFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null) | null;
  /** Restore focus to the previously focused element on deactivate. */
  restoreFocus?: boolean;
  /** Called when the trap deactivates, before restoring focus. */
  onDeactivate?: () => void;
}

/**
 * Focus trap used by Modal, Drawer, Popconfirm and Tour.
 * - moves initial focus into the container
 * - cycles Tab / Shift+Tab inside the container
 * - restores focus when unmounted
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions,
): void {
  const { active, initialFocus, restoreFocus = true, onDeactivate } = options;

  useEffect(() => {
    if (!active || typeof document === 'undefined') return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    let container: HTMLElement | null = null;
    const focusInitial = () => {
      // Portal may mount or move its children after the activation commit.
      container = containerRef.current;
      if (!container) return;
      container.addEventListener('keydown', onKeyDown);
      let target: HTMLElement | null = null;
      if (typeof initialFocus === 'function') target = initialFocus();
      else if (initialFocus?.current) target = initialFocus.current;
      target = target ?? getFocusableElements(container)[0] ?? container;
      if (!container.contains(document.activeElement)) {
        target.focus({ preventScroll: true });
      }
    };

    // Defer a frame so the dialog is mounted and visible before focusing.
    const frame = window.requestAnimationFrame(focusInitial);

    const onKeyDown = (event: KeyboardEvent) => {
      if (!container || event.key !== 'Tab' || event.defaultPrevented) return;
      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const first = focusables[0] as HTMLElement;
      const last = focusables[focusables.length - 1] as HTMLElement;
      const activeElement = document.activeElement;
      if (event.shiftKey) {
        if (activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeElement === last || !container.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    return () => {
      window.cancelAnimationFrame(frame);
      container?.removeEventListener('keydown', onKeyDown);
      onDeactivate?.();
      if (restoreFocus && previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
    // initialFocus is intentionally read at activation time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, containerRef, restoreFocus]);
}
