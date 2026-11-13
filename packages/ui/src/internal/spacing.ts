/**
 * Shared spacing vocabulary. Layout primitives accept token names (never raw
 * pixel numbers) so every gap remains traceable to the 4px rhythm.
 */
export type SpaceSize =
  | '0'
  | '0-5'
  | '1'
  | '1-5'
  | '2'
  | '2-5'
  | '3'
  | '3-5'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '12'
  | '14'
  | '16'
  | '20'
  | '24';

/** Resolve a spacing token name to a CSS length expression. */
export function spaceValue(size: SpaceSize): string {
  return `var(--yuki-space-${size})`;
}

export const spaceSizes: readonly SpaceSize[] = [
  '0',
  '0-5',
  '1',
  '1-5',
  '2',
  '2-5',
  '3',
  '3-5',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '20',
  '24',
];
