import { optionLabelText } from '../select/select-utils';
import type { ReactNode } from 'react';

/** A node in the cascader tree. Leaves are nodes without `children`. */
export interface CascaderOption<T = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  children?: readonly CascaderOption<T>[];
  /** Force a node to behave as a leaf even when it has children. */
  isLeaf?: boolean;
}

export type CascaderValue<T = string> = readonly T[];

export interface CascaderLeaf<T = string> {
  path: T[];
  nodes: CascaderOption<T>[];
  labels: ReactNode[];
  option: CascaderOption<T>;
}

export function isLeafOption<T>(option: CascaderOption<T>): boolean {
  return option.isLeaf === true || !option.children || option.children.length === 0;
}

/** Flattens every leaf together with the path that leads to it. */
export function flattenCascaderLeaves<T>(
  options: readonly CascaderOption<T>[],
  parentPath: T[] = [],
  parentNodes: CascaderOption<T>[] = [],
  parentLabels: ReactNode[] = [],
): CascaderLeaf<T>[] {
  const leaves: CascaderLeaf<T>[] = [];
  for (const option of options) {
    const path = [...parentPath, option.value];
    const nodes = [...parentNodes, option];
    const labels = [...parentLabels, option.label];
    if (isLeafOption(option)) {
      leaves.push({ path, nodes, labels, option });
    } else {
      leaves.push(...flattenCascaderLeaves(option.children ?? [], path, nodes, labels));
    }
  }
  return leaves;
}

/** Resolves a value path to the option nodes it represents. */
export function findCascaderNodes<T>(
  options: readonly CascaderOption<T>[],
  path: readonly T[],
): CascaderOption<T>[] {
  const nodes: CascaderOption<T>[] = [];
  let level = options;
  for (const value of path) {
    const found = level.find((option) => Object.is(option.value, value));
    if (!found) break;
    nodes.push(found);
    level = found.children ?? [];
  }
  return nodes;
}

export function filterCascaderLeaves<T>(
  leaves: readonly CascaderLeaf<T>[],
  query: string,
  filterOption?: (query: string, leaf: CascaderLeaf<T>) => boolean,
): CascaderLeaf<T>[] {
  const trimmed = query.trim();
  if (!trimmed) return [...leaves];
  const lower = trimmed.toLowerCase();
  return leaves.filter((leaf) => {
    if (filterOption) return filterOption(trimmed, leaf);
    return leaf.nodes.some((node) =>
      optionLabelText(node).toLowerCase().includes(lower),
    );
  });
}
