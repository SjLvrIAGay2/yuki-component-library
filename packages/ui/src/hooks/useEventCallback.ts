import { useCallback, useRef } from 'react';
import { useIsomorphicLayoutEffect } from '../internal/useIsomorphicLayoutEffect';

/** A callback whose identity is stable but always sees the latest closure. */
export function useEventCallback<T extends (...args: never[]) => unknown>(callback: T): T {
  const ref = useRef(callback);
  useIsomorphicLayoutEffect(() => {
    ref.current = callback;
  }, [callback]);
  return useCallback(((...args: never[]) => ref.current(...args)) as T, []);
}
