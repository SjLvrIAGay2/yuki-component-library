import { createRoot, type Root } from 'react-dom/client';
import type { ReactNode } from 'react';

export interface ImperativeHostItem {
  id: string;
}

export interface ImperativeHostOptions<Item extends ImperativeHostItem> {
  /** Value of the `data-yuki-imperative` attribute on the mount node (debugging/testing). */
  name: string;
  /** Extra class applied to the mount node. */
  className?: string;
  /** Renders the current stack; called whenever items change. */
  render: (items: readonly Item[], remove: (id: string) => void) => ReactNode;
}

export interface ImperativeHost<Item extends ImperativeHostItem> {
  push: (item: Item, maxCount?: number) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<Item>) => void;
  destroy: () => void;
  get: (id: string) => Item | undefined;
}

/**
 * Popup container managed by ConfigProvider. Falls back to `document.body` so the
 * API also works without a provider (and in tests).
 */
export function getImperativeOpenContainer(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLElement>('[data-yuki-portal]') ?? document.body;
}

/**
 * Lazily creates a React root for an imperative component stack (message,
 * notification, modal confirmations). The root mounts into the ConfigProvider
 * popup container so CSS variables are inherited from the provider DOM scope.
 */
export function createImperativeHost<Item extends ImperativeHostItem>(
  options: ImperativeHostOptions<Item>,
): ImperativeHost<Item> {
  const items: Item[] = [];
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  const ensure = (): boolean => {
    if (root && container?.isConnected) return true;
    const parent = getImperativeOpenContainer();
    if (!parent) return false;
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('data-yuki-imperative', options.name);
      if (options.className) container.className = options.className;
      root = createRoot(container);
    }
    parent.appendChild(container);
    return true;
  };

  function remove(id: string) {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;
    items.splice(index, 1);
    flush();
  }

  function flush() {
    if (!root) return;
    root.render(options.render(items.slice(), remove));
  }

  return {
    push(item, maxCount = 0) {
      if (!ensure()) return;
      const existing = items.findIndex(entry => entry.id === item.id);
      if (existing >= 0) {
        items[existing] = item;
      } else {
        items.push(item);
        if (maxCount > 0 && items.length > maxCount) {
          items.splice(0, items.length - Math.max(1, Math.floor(maxCount)));
        }
      }
      flush();
    },
    remove,
    update(id, patch) {
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return;
      items[index] = { ...items[index], ...patch } as Item;
      flush();
    },
    destroy() {
      items.length = 0;
      if (root) {
        root.unmount();
        root = null;
      }
      container?.remove();
      container = null;
    },
    get: (id) => items.find(item => item.id === id),
  };
}

let imperativeSeq = 0;

/** Monotonic id generator for imperative items. */
export function nextImperativeId(prefix: string): string {
  imperativeSeq += 1;
  return `${prefix}-${imperativeSeq}`;
}

/** React children also include iterables, fragments and portals. Only a config object sets notice options. */
export function isNoticeOptions<Options extends object>(input: Options | ReactNode): input is Options {
  return (
    typeof input === 'object' &&
    input !== null &&
    !(Symbol.iterator in input) &&
    !('$$typeof' in input) &&
    !('then' in input)
  );
}
