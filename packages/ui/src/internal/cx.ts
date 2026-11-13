/** Join class names, ignoring falsy values. */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | null | undefined>;

export function cx(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
      continue;
    }
    for (const key of Object.keys(value)) {
      if (value[key]) out.push(key);
    }
  }
  return out.join(' ');
}
