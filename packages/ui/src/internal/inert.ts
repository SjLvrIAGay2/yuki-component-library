import { version } from 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    inert?: boolean | undefined;
  }
}

/** React 18 treats inert as an unknown string attribute; React 19 treats it as boolean. */
export function inertValue(inert: boolean | undefined): boolean | undefined {
  if (!inert) return undefined;
  return Number.parseInt(version, 10) >= 19 ? true : ('' as unknown as boolean);
}
