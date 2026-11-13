/* =============================================================================
 * Live example discovery
 * -----------------------------------------------------------------------------
 * Examples live at src/examples/<slug>/NN-name.tsx and default-export a React
 * component. The markdown side references them with <Demo id="<slug>/NN-name" />.
 * ========================================================================== */

import { lazy, type ComponentType } from 'react';

const components = import.meta.glob<{ default: ComponentType }>('../examples/**/*.tsx');

const sources = import.meta.glob<string>('../examples/**/*.tsx', {
  query: '?raw',
  import: 'default',
});

export interface ExampleEntry {
  id: string;
  name: string;
  Component: ComponentType;
  loadSource: () => Promise<string>;
}

function toEntry(path: string, Component: ComponentType): ExampleEntry | null {
  const match = /\/examples\/([^/]+)\/([^/]+)\.tsx$/.exec(path);
  if (!match) return null;
  const slug = match[1] ?? '';
  const name = match[2] ?? '';
  const loadSource = sources[path];
  if (!loadSource) return null;
  return { id: `${slug}/${name}`, name, Component, loadSource };
}

const entries = new Map<string, ExampleEntry>();
for (const [path, load] of Object.entries(components)) {
  const entry = toEntry(path, lazy(load));
  if (entry) entries.set(entry.id, entry);
}

export function getExample(id: string): ExampleEntry | undefined {
  return entries.get(id);
}

export function getExamples(slug: string): ExampleEntry[] {
  return [...entries.values()]
    .filter((entry) => entry.id.startsWith(`${slug}/`))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function exampleCount(): number {
  return entries.size;
}
