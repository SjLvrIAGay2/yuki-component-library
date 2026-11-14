import type { CSSProperties } from 'react';

/** The React branch also accepts existing CSSProperties objects without an index signature. */
export type StyleProperties = CSSProperties | (CSSProperties & {
  [variable: `--${string}`]: string | number | undefined;
});

/** Preserve the element's native props while accepting custom properties in its style. */
export type WithStyle<Props> = Props & { style?: StyleProperties | undefined };
