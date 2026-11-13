export const canUseDOM = (): boolean =>
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/** All tabbable descendants of a container, in DOM order. */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.tabIndex >= 0 && !el.matches(':disabled') &&
      !el.closest('[inert], [hidden], [aria-hidden="true"]') &&
      window.getComputedStyle(el).visibility !== 'hidden' &&
      window.getComputedStyle(el).display !== 'none',
  );
}

export function isFocusable(element: Element | null): element is HTMLElement {
  if (!element || typeof HTMLElement === 'undefined' || !(element instanceof HTMLElement)) return false;
  return element.matches(FOCUSABLE_SELECTOR);
}

export function contains(parent: Node | null | undefined, child: Node | null | undefined): boolean {
  if (!parent || !child) return false;
  return parent === child || parent.contains(child);
}

/** Resolve the nearest scrollable ancestor (for sticky/affix/virtualised lists). */
export function getScrollParent(node: HTMLElement | null): HTMLElement | Window | null {
  if (typeof window === 'undefined') return null;
  if (!node) return window;
  let parent: HTMLElement | null = node;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

export function getOwnerDocument(node?: HTMLElement | null): Document {
  return node?.ownerDocument ?? (typeof document !== 'undefined' ? document : (null as never));
}

/** RN-safe no-op ref. */
export function noop(): void {
  /* intentionally empty */
}

/** Scroll an element into view without triggering smooth motion when reduced. */
export function scrollIntoViewIfNeeded(element: HTMLElement | null, block: ScrollLogicalPosition = 'nearest'): void {
  if (!element) return;
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ block, inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
}

/** A stable numeric id used for aria wiring. */
let autoId = 0;
export function nextId(prefix = 'yuki'): string {
  autoId += 1;
  return `${prefix}-${autoId}`;
}
