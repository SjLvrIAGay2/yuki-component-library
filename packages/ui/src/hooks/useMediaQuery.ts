import { useCallback, useMemo, useSyncExternalStore } from 'react';

const serverSnapshot = () => false;

/** Use the same initial snapshot on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  const media = useMemo(
    () => typeof window === 'undefined' ? undefined : window.matchMedia?.(query),
    [query],
  );
  const subscribe = useCallback((notify: () => void) => {
    media?.addEventListener('change', notify);
    return () => media?.removeEventListener('change', notify);
  }, [media]);
  return useSyncExternalStore(subscribe, () => media?.matches ?? false, serverSnapshot);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
