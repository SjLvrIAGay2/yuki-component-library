import type { ReactNode } from 'react';

export interface TreeNodeOption<T = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  isLeaf?: boolean;
  children?: readonly TreeNodeOption<T>[];
}

export interface TreeRow<T> {
  node: TreeNodeOption<T>;
  depth: number;
  parentValue: T | null;
  disabled: boolean;
  hasChildren: boolean;
  leaf: boolean;
}

export function hasTreeChildren<T>(node: TreeNodeOption<T>): boolean {
  if (node.isLeaf) return false;
  return Boolean(node.children && node.children.length > 0);
}

export function treeNodeText<T>(node: TreeNodeOption<T>): string {
  const { label } = node;
  if (typeof label === 'string' || typeof label === 'number') return String(label);
  if (Array.isArray(label))
    return label.map((part) => (typeof part === 'string' ? part : '')).join('');
  return '';
}

export function collectExpandableKeys<T>(
  options: readonly TreeNodeOption<T>[],
  target: T[] = [],
): T[] {
  options.forEach((node) => {
    if (hasTreeChildren(node)) {
      target.push(node.value);
      collectExpandableKeys(node.children ?? [], target);
    }
  });
  return target;
}

export function flattenVisibleTree<T>(
  options: readonly TreeNodeOption<T>[],
  expanded: ReadonlySet<T>,
  inheritDisabled = false,
): TreeRow<T>[] {
  const rows: TreeRow<T>[] = [];
  const walk = (
    nodes: readonly TreeNodeOption<T>[],
    depth: number,
    parentValue: T | null,
    parentDisabled: boolean,
  ) => {
    nodes.forEach((node) => {
      const hasChildren = hasTreeChildren(node);
      const disabled = Boolean(node.disabled || (inheritDisabled && parentDisabled));
      rows.push({ node, depth, parentValue, hasChildren, leaf: !hasChildren, disabled });
      if (hasChildren && expanded.has(node.value)) {
        walk(node.children ?? [], depth + 1, node.value, disabled);
      }
    });
  };
  walk(options, 0, null, false);
  return rows;
}

export function findTreePath<T>(
  options: readonly TreeNodeOption<T>[],
  value: T,
): TreeNodeOption<T>[] {
  for (const node of options) {
    if (Object.is(node.value, value)) return [node];
    if (node.children && node.children.length > 0) {
      const path = findTreePath(node.children, value);
      if (path.length > 0) return [node, ...path];
    }
  }
  return [];
}

export function findTreeNode<T>(
  options: readonly TreeNodeOption<T>[],
  value: T,
): TreeNodeOption<T> | null {
  const path = findTreePath(options, value);
  return path.length > 0 ? (path[path.length - 1] ?? null) : null;
}

export function getAncestorKeys<T>(options: readonly TreeNodeOption<T>[], value: T): T[] {
  const path = findTreePath(options, value);
  return path.slice(0, -1).map((node) => node.value);
}

export interface FilteredTree<T> {
  tree: TreeNodeOption<T>[];
  expandedKeys: T[];
}

export function filterTreeNodes<T>(
  options: readonly TreeNodeOption<T>[],
  query: string,
  filter?: (query: string, node: TreeNodeOption<T>) => boolean,
): FilteredTree<T> {
  const normalized = query.trim().toLowerCase();
  const expandedKeys: T[] = [];
  const matches = (node: TreeNodeOption<T>) =>
    filter ? filter(query, node) : treeNodeText(node).toLowerCase().includes(normalized);

  const walk = (nodes: readonly TreeNodeOption<T>[]): TreeNodeOption<T>[] => {
    const result: TreeNodeOption<T>[] = [];
    nodes.forEach((node) => {
      if (matches(node)) {
        result.push(node);
        return;
      }
      const children = node.children ? walk(node.children) : [];
      if (children.length > 0) {
        expandedKeys.push(node.value);
        result.push({ ...node, children });
      }
    });
    return result;
  };

  return { tree: walk(options), expandedKeys };
}

export function findRowIndex<T>(rows: readonly TreeRow<T>[], value: T | null): number {
  if (value === null) return -1;
  return rows.findIndex((row) => Object.is(row.node.value, value));
}

export function firstEnabledRow<T>(rows: readonly TreeRow<T>[]): number {
  return rows.findIndex((row) => !row.disabled);
}

export function lastEnabledRow<T>(rows: readonly TreeRow<T>[]): number {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (!rows[index]?.disabled) return index;
  }
  return -1;
}

export function nextEnabledRow<T>(
  rows: readonly TreeRow<T>[],
  from: number,
  delta: number,
): number {
  if (rows.length === 0) return -1;
  const step = delta >= 0 ? 1 : -1;
  let index = from;
  for (let attempt = 0; attempt < rows.length; attempt += 1) {
    index = (index + step + rows.length) % rows.length;
    if (!rows[index]?.disabled) return index;
  }
  return -1;
}

export function typeaheadRow<T>(rows: readonly TreeRow<T>[], query: string, from: number): number {
  if (rows.length === 0 || query.length === 0) return -1;
  const needle = query.toLowerCase();
  const order: number[] = [];
  for (let offset = 1; offset <= rows.length; offset += 1) {
    order.push((from + offset) % rows.length);
  }
  const matches = (row: TreeRow<T>, kind: 'prefix' | 'includes') => {
    const text = treeNodeText(row.node).toLowerCase();
    return kind === 'prefix' ? text.startsWith(needle) : text.includes(needle);
  };
  const prefixHit = order.find((index) => {
    const row = rows[index];
    return row && !row.disabled && matches(row, 'prefix');
  });
  if (prefixHit !== undefined) return prefixHit;
  const includesHit = order.find((index) => {
    const row = rows[index];
    return row && !row.disabled && matches(row, 'includes');
  });
  return includesHit ?? -1;
}
