export const DEFAULT_MAX_RENDERED_LINES = 10_000;

/** Scan for the cutoff before splitting, so newline-heavy files do not allocate one item per line. */
export function limitTextLines(text: string, requested = DEFAULT_MAX_RENDERED_LINES) {
  const limit =
    Number.isFinite(requested) && requested >= 1
      ? Math.floor(requested)
      : DEFAULT_MAX_RENDERED_LINES;
  let offset = 0;
  for (let line = 0; line < limit; line++) {
    const next = text.indexOf('\n', offset);
    if (next === -1) return { text, truncated: false, limit };
    if (line === limit - 1) return { text: text.slice(0, next), truncated: true, limit };
    offset = next + 1;
  }
  return { text, truncated: false, limit };
}
