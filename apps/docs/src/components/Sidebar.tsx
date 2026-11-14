import { useEffect, useMemo, useRef } from 'react';
import { Icon, useMediaQuery, useFocusTrap, useScrollLock } from '@yuki-ui/react';
import type { DocPage } from '../lib/content';

export interface SidebarProps {
  groups: Array<{ title: string; items: DocPage[] }>;
  activeSlug: string | null;
  route: 'home' | 'tokens' | 'doc';
  query: string;
  onQueryChange: (value: string) => void;
  onNavigate: (hash: string) => void;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function Sidebar({
  groups,
  activeSlug,
  route,
  query,
  onQueryChange,
  onNavigate,
  open,
  onClose, onOpen,
}: SidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const narrow = useMediaQuery('(max-width: 68rem)');
  useFocusTrap(sidebarRef, { active: narrow && open, initialFocus: inputRef });
  useScrollLock(narrow && open);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.isComposing || event.defaultPrevented) return;
      const editing = (event.target as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !editing && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        if (narrow && !open) onOpen();
        else { inputRef.current?.focus(); inputRef.current?.select(); }
      } else if (event.key === 'Escape' && (document.activeElement === inputRef.current || (narrow && open))) {
        event.preventDefault();
        if (query) onQueryChange('');
        else if (narrow && open) onClose();
        else inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [narrow, open, onOpen, onClose, query, onQueryChange]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return groups;
    return groups
      .map((group) => ({
        title: group.title,
        items: group.items.filter(
          (page) =>
            page.title.toLowerCase().includes(keyword) ||
            page.slug.includes(keyword) ||
            page.description.toLowerCase().includes(keyword),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const go = (hash: string) => {
    onNavigate(hash);
    onClose();
  };

  return (
    <>
      <div
        className={`docs-sidebar-backdrop${open ? ' docs-sidebar-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <aside ref={sidebarRef} id="docs-navigation" role={narrow && open ? 'dialog' : undefined}
        aria-label="文档导航" aria-modal={narrow && open || undefined} className={`docs-sidebar${open ? ' docs-sidebar--open' : ''}`}>
        <button type="button" className="docs-brand" onClick={() => go('#/')}>
          <span className="docs-brand__mark" aria-hidden>
            <Icon name="snowflake" size="1.05rem" />
          </span>
          <span className="docs-brand__text">
            <strong>Yuki UI</strong>
            <small>静谧的界面语言</small>
          </span>
        </button>

        <label className="docs-search">
          <Icon name="search" size="0.875rem" className="docs-search__icon" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="搜索组件、能力…"
            aria-label="搜索组件"
          />
          <kbd>/</kbd>
        </label>

        <nav className="docs-nav" aria-label="组件文档">
          <div className="docs-nav__group">
            <span className="docs-nav__title">指南</span>
            <button
              type="button"
              className={`docs-nav__link${route === 'home' ? ' docs-nav__link--active' : ''}`}
              onClick={() => go('#/')}
            >
              <Icon name="home" size="0.9375rem" />
              概览
            </button>
            <button
              type="button"
              className={`docs-nav__link${route === 'tokens' ? ' docs-nav__link--active' : ''}`}
              onClick={() => go('#/tokens')}
            >
              <Icon name="palette" size="0.9375rem" />
              设计令牌
            </button>
          </div>

          {filtered.map((group) => (
            <div className="docs-nav__group" key={group.title}>
              <span className="docs-nav__title">{group.title}</span>
              {group.items.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  className={`docs-nav__link${
                    activeSlug === page.slug ? ' docs-nav__link--active' : ''
                  }`}
                  onClick={() => go(`#/c/${page.slug}`)}
                >
                  <span className="docs-nav__label">{page.title}</span>
                  {page.slug !== page.title ? (
                    <span className="docs-nav__slug">{page.slug}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}

          {filtered.length === 0 ? (
            <p className="docs-nav__empty">没有匹配的组件。</p>
          ) : null}
        </nav>

        <div className="docs-sidebar__footer">
          <span>v0.1.0</span>
          <span>React · TypeScript</span>
        </div>
      </aside>
    </>
  );
}
