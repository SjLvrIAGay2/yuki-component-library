interface GlobalTheme {
  attrs: Record<string, string>;
  tokens: Record<string, string | number>;
}

interface DocumentTheme {
  layers: Map<symbol, GlobalTheme>;
  originalAttrs: Map<string, string | null>;
  originalTokens: Map<string, { value: string; priority: string }>;
}

const documents = new WeakMap<HTMLElement, DocumentTheme>();

/** Apply active providers in mount order; a prop update keeps its provider's precedence. */
export function setGlobalTheme(root: HTMLElement, owner: symbol, theme: GlobalTheme | null) {
  let state = documents.get(root);
  if (!state) {
    if (!theme) return;
    state = { layers: new Map(), originalAttrs: new Map(), originalTokens: new Map() };
    documents.set(root, state);
  }

  if (theme) {
    state.layers.set(owner, theme);
    for (const key of Object.keys(theme.attrs)) {
      if (!state.originalAttrs.has(key)) state.originalAttrs.set(key, root.getAttribute(key));
    }
    for (const key of Object.keys(theme.tokens)) {
      if (!state.originalTokens.has(key)) {
        state.originalTokens.set(key, {
          value: root.style.getPropertyValue(key),
          priority: root.style.getPropertyPriority(key),
        });
      }
    }
  } else {
    state.layers.delete(owner);
  }

  const attrs: Record<string, string> = {};
  const tokens: Record<string, string | number> = {};
  for (const layer of state.layers.values()) {
    Object.assign(attrs, layer.attrs);
    Object.assign(tokens, layer.tokens);
  }
  for (const [key, original] of state.originalAttrs) {
    if (key in attrs) root.setAttribute(key, attrs[key]!);
    else {
      if (original === null) root.removeAttribute(key);
      else root.setAttribute(key, original);
      state.originalAttrs.delete(key);
    }
  }
  for (const [key, original] of state.originalTokens) {
    if (key in tokens) root.style.setProperty(key, String(tokens[key]));
    else {
      if (original.value) root.style.setProperty(key, original.value, original.priority);
      else root.style.removeProperty(key);
      state.originalTokens.delete(key);
    }
  }
  if (!state.layers.size) documents.delete(root);
}
