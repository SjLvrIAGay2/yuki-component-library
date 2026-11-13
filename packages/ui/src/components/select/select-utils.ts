import type { ReactNode } from 'react';

/** Shared option model for the whole form-selection family. */
export type SelectStatus = 'error' | 'warning' | 'success';

export interface SelectOption<T = string> {
  /** Underlying value emitted by `onChange`. */
  value: T;
  /** Visible content. Use `textValue` when it is not plain text. */
  label: ReactNode;
  disabled?: boolean;
  /** Plain-text used for typeahead + filtering when `label` is not a string. */
  textValue?: string;
  /** Optional secondary line under the label. */
  description?: ReactNode;
}

export interface SelectOptionGroup<T = string> {
  label: ReactNode;
  options: readonly SelectOption<T>[];
}

export type SelectOptionInput<T = string> = SelectOption<T> | SelectOptionGroup<T>;

export function isSelectOptionGroup<T>(item: SelectOptionInput<T>): item is SelectOptionGroup<T> {
  return 'options' in item;
}

export type SelectRow<T> =
  | { type: 'group'; key: string; label: ReactNode }
  | { type: 'option'; key: string; option: SelectOption<T>; index: number };

export interface BuiltSelectRows<T> {
  rows: SelectRow<T>[];
  /** Every option in render order; indexes match the `option` row indexes. */
  options: SelectOption<T>[];
}

/** Flatten `SelectOption | SelectOptionGroup` input into rows + a plain option list. */
export function buildSelectRows<T>(
  items: readonly SelectOptionInput<T>[],
): BuiltSelectRows<T> {
  const rows: SelectRow<T>[] = [];
  const options: SelectOption<T>[] = [];
  let optionIndex = 0;

  items.forEach((item, itemIndex) => {
    if (isSelectOptionGroup(item)) {
      rows.push({ type: 'group', key: `group-${itemIndex}`, label: item.label });
      item.options.forEach((option) => {
        rows.push({ type: 'option', key: `option-${optionIndex}`, option, index: optionIndex });
        options.push(option);
        optionIndex += 1;
      });
      return;
    }
    rows.push({ type: 'option', key: `option-${optionIndex}`, option: item, index: optionIndex });
    options.push(item);
    optionIndex += 1;
  });

  return { rows, options };
}

/** Filter grouped options while preserving group order and dropping empty groups. */
export function filterSelectItems<T>(
  items: readonly SelectOptionInput<T>[],
  predicate: (option: SelectOption<T>) => boolean,
): SelectOptionInput<T>[] {
  const filtered: SelectOptionInput<T>[] = [];
  items.forEach((item) => {
    if (isSelectOptionGroup(item)) {
      const options = item.options.filter(predicate);
      if (options.length > 0) filtered.push({ label: item.label, options });
      return;
    }
    if (predicate(item)) filtered.push(item);
  });
  return filtered;
}

/** Plain text a user can type to jump to an option. */
export function optionLabelText<T>(option: SelectOption<T>): string {
  if (option.textValue != null) return option.textValue;
  const { label } = option;
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  if (typeof option.value === 'string' || typeof option.value === 'number') {
    return String(option.value);
  }
  return '';
}

export function defaultFilterOption<T>(query: string, option: SelectOption<T>): boolean {
  if (!query) return true;
  return optionLabelText(option).toLowerCase().includes(query.toLowerCase());
}

/** Next enabled index, wrapping around. `from = -1` starts at the first / last item. */
export function findEnabledIndex<T>(
  options: readonly SelectOption<T>[],
  from: number,
  delta: number,
): number {
  const count = options.length;
  if (count === 0) return -1;
  let index = from;
  for (let step = 0; step < count; step += 1) {
    index = (index + delta + count) % count;
    const option = options[index];
    if (option && !option.disabled) return index;
  }
  return -1;
}

export function firstEnabledIndex<T>(options: readonly SelectOption<T>[]): number {
  return options.findIndex((option) => !option.disabled);
}

export function lastEnabledIndex<T>(options: readonly SelectOption<T>[]): number {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    const option = options[index];
    if (option && !option.disabled) return index;
  }
  return -1;
}

/**
 * Typeahead search: prefer prefix matches, then substring matches, scanning
 * forward from `from` and wrapping once. Disabled options are skipped.
 */
export function findTypeaheadIndex<T>(
  options: readonly SelectOption<T>[],
  query: string,
  from: number,
): number {
  const needle = query.toLowerCase();
  const count = options.length;
  if (!needle || count === 0) return -1;

  const scan = (predicate: (text: string) => boolean): number => {
    for (let step = 1; step <= count; step += 1) {
      const index = (from + step + count) % count;
      const option = options[index];
      if (!option || option.disabled) continue;
      if (predicate(optionLabelText(option).toLowerCase())) return index;
    }
    return -1;
  };

  const prefix = scan((text) => text.startsWith(needle));
  return prefix >= 0 ? prefix : scan((text) => text.includes(needle));
}
