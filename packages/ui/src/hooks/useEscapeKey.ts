import { useContext, useEffect } from 'react';
import { EscapeScope } from '../internal/escapeScope';
import { useEventCallback } from './useEventCallback';

type EscapeHandler = (event: KeyboardEvent) => void;
const layers = new WeakMap<EventTarget, { handler: EscapeHandler; scope: HTMLElement | null }[]>();

/** Dismiss only the most recently opened layer on a target. */
export function useEscapeKey(
  handler: EscapeHandler,
  enabled = true,
  target?: HTMLElement | Document,
): void {
  const callback = useEventCallback(handler);
  const scope = useContext(EscapeScope);
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const element = target ?? document;
    const stack = layers.get(element) ?? [];
    if (!stack.length) {
      layers.set(element, stack);
      element.addEventListener('keydown', dispatch as EventListener);
    }
    const layer = { handler: callback, scope };
    stack.push(layer);
    return () => {
      stack.splice(stack.indexOf(layer), 1);
      if (!stack.length) {
        element.removeEventListener('keydown', dispatch as EventListener);
        layers.delete(element);
      }
    };
  }, [enabled, target, callback, scope]);
}

function dispatch(event: KeyboardEvent) {
  if (!event.currentTarget || event.key !== 'Escape' || event.isComposing || event.defaultPrevented) return;
  const handler = layers.get(event.currentTarget)?.at(-1)?.handler;
  if (handler) {
    handler(event);
    event.preventDefault();
  }
}


/** Radix checks Escape in the capture phase, before nested controls can handle it. */
export function dismissScopedLayer(event: KeyboardEvent, scope: HTMLElement | null) {
  if (!scope || event.isComposing || event.defaultPrevented) return;
  const layer = layers.get(scope.ownerDocument)?.at(-1);
  if (layer?.scope === scope) {
    layer.handler(event);
    event.preventDefault();
  }
}
