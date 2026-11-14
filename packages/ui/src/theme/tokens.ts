import type { TokenName } from './token-names';

export type { TokenName } from './token-names';

/** Built-in names are suggested alongside the custom keys accepted by the provider. */
export type ThemeTokens = Partial<Record<TokenName | `--yuki-${TokenName}`, string | number>>
  & Record<string, string | number>;

/** Reference a built-in design token in CSS, inline styles or theme overrides. */
export function tokenVar<Name extends TokenName>(name: Name): `var(--yuki-${Name})` {
  return `var(--yuki-${name})`;
}
