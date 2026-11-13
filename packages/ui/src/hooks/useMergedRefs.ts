import { useCallback, type Ref, type RefCallback } from 'react';

type PossibleRef<T> = Ref<T> | undefined | null;

function setRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (typeof ref === 'function') {
    (ref as RefCallback<T>)(value);
  } else if (ref && typeof ref === 'object') {
    (ref as { current: T | null }).current = value;
  }
}

/** Merge multiple refs (callback or object) into one stable callback ref. */
export function useMergedRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  return useCallback((node: T | null) => {
    for (const ref of refs) setRef(ref, node);
  }, refs);
}
