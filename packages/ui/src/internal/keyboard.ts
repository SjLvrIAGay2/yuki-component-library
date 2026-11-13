/** Shared keyboard navigation primitives for listbox-style components. */

export function nextIndex(
  current: number,
  delta: number,
  count: number,
  loop = true,
): number {
  if (count <= 0) return -1;
  let next = current + delta;
  if (loop) {
    next = ((next % count) + count) % count;
  } else {
    next = Math.min(Math.max(next, 0), count - 1);
  }
  return next;
}

export interface TypeaheadState {
  query: string;
  timer: ReturnType<typeof setTimeout> | null;
}

export function createTypeahead() {
  let state: TypeaheadState = { query: '', timer: null };
  const resetDelay = 600;

  return {
    push(character: string): string {
      if (state.timer) clearTimeout(state.timer);
      state.query += character.toLowerCase();
      state.timer = setTimeout(() => {
        state = { query: '', timer: null };
      }, resetDelay);
      return state.query;
    },
    clear(): void {
      if (state.timer) clearTimeout(state.timer);
      state = { query: '', timer: null };
    },
    get value(): string {
      return state.query;
    },
  };
}

export function isPrintableKey(event: React.KeyboardEvent | KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  return event.key.length === 1 && event.key !== ' ';
}
