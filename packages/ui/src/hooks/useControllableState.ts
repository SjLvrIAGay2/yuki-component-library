import { useCallback, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';

export interface UseControllableStateProps<T> {
  /** A defined value makes the caller the owner of the state. */
  value?: T;
  defaultValue: T | (() => T);
  onChange?: (value: T) => void;
}

/** Shares controlled and uncontrolled state, including batched functional updates. */
export function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateProps<T>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const pending = useRef(internalValue);
  const notify = useEventCallback((next: T) => onChange?.(next));

  const setValue = useCallback((next: T | ((previous: T) => T)) => {
    const previous = isControlled ? value : pending.current;
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;
    if (Object.is(previous, resolved)) return;
    if (!isControlled) {
      pending.current = resolved;
      setInternalValue(() => resolved);
    }
    notify(resolved);
  }, [isControlled, value, notify]);

  return [isControlled ? value : internalValue, setValue, isControlled] as const;
}
