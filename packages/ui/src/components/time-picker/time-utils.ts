/** Small, dependency-free helpers for the time selection family. */

export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

export const DEFAULT_TIME_PARTS: TimeParts = { hours: 0, minutes: 0, seconds: 0 };

export function padTwo(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function getNowParts(): TimeParts {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
}

/**
 * Parses `HH:mm`, `HH:mm:ss` or `HHmm` style values. Returns null for empty or
 * malformed input so the picker can fall back to a placeholder.
 */
export function parseTime(value: string | null | undefined): TimeParts | null {
  if (!value) return null;
  const match = /^\s*(\d{1,2})(?::?(\d{1,2}))?(?::?(\d{1,2}))?\s*$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = match[2] === undefined ? 0 : Number(match[2]);
  const seconds = match[3] === undefined ? 0 : Number(match[3]);
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return { hours, minutes, seconds };
}

export function formatTime(parts: TimeParts, showSeconds = false): string {
  const base = `${padTwo(parts.hours)}:${padTwo(parts.minutes)}`;
  return showSeconds ? `${base}:${padTwo(parts.seconds)}` : base;
}

export function compareParts(a: TimeParts, b: TimeParts): number {
  return (
    a.hours * 3600 + a.minutes * 60 + a.seconds - (b.hours * 3600 + b.minutes * 60 + b.seconds)
  );
}

export function clampParts(parts: TimeParts, min?: TimeParts | null, max?: TimeParts | null): TimeParts {
  if (min && compareParts(parts, min) < 0) return min;
  if (max && compareParts(parts, max) > 0) return max;
  return parts;
}

export function sameParts(a: TimeParts | null | undefined, b: TimeParts | null | undefined): boolean {
  if (a == null || b == null) return a == null && b == null;
  return compareParts(a, b) === 0;
}

/** Inclusive list of values with a step; 0 is snapped down to the previous step. */
export function getStepValues(start: number, end: number, step = 1): number[] {
  const safeStep = Math.max(1, Math.floor(step));
  const values: number[] = [];
  for (let value = start; value <= end; value += safeStep) values.push(value);
  return values;
}

export function stepParts(parts: TimeParts, part: 'hours' | 'minutes' | 'seconds', delta: number): TimeParts {
  if (part === 'hours') return { ...parts, hours: (parts.hours + delta + 24) % 24 };
  if (part === 'minutes') return { ...parts, minutes: (parts.minutes + delta + 60) % 60 };
  return { ...parts, seconds: (parts.seconds + delta + 60) % 60 };
}
