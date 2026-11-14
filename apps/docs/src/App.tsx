import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfigProvider, type LocaleName, type ThemeMode } from '@yuki-ui/react';
import { navGroups, pages, findPage } from './lib/content';
import { Sidebar } from './components/Sidebar';
import { TopBar, type DocsLocale, type DocsTheme } from './components/TopBar';
import { Home } from './pages/Home';
import { usePlaygroundPreferences } from './lib/playground';
import { TokensPage } from './pages/TokensPage';
import { ComponentPage } from './pages/ComponentPage';

type Route = { kind: 'home' } | { kind: 'tokens' } | { kind: 'doc'; slug: string } | { kind: 'missing' };

function readRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash) return { kind: 'home' };
  if (hash === 'tokens') return { kind: 'tokens' };
  const doc = /^c\/([^/?]+)(?:\?.*)?$/.exec(hash);
  if (doc?.[1]) {
    try {
      const slug = decodeURIComponent(doc[1]);
      if (findPage(slug)) return { kind: 'doc', slug };
    } catch { /* An invalid percent escape is an unknown route. */ }
  }
  return { kind: 'missing' };
}

function themeOverride(): DocsTheme | null {
  if (typeof window === 'undefined') return null;
  const param = new URLSearchParams(window.location.search).get('theme');
  return param === 'light' || param === 'dark' || param === 'system' ? param : null;
}

function readPreference(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function savePreference(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Keep in-memory preferences when storage is unavailable. */ }
}

function initialTheme(): DocsTheme {
  const override = themeOverride();
  if (override) return override;
  const stored = readPreference('yuki-docs-theme');
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

function initialLocale(): DocsLocale {
  const stored = readPreference('yuki-docs-locale');
  return stored === 'en-US' ? 'en-US' : 'zh-CN';
}

export function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  const [theme, setTheme] = useState<DocsTheme>(initialTheme);
  const [locale, setLocale] = useState<DocsLocale>(initialLocale);
  const playground = usePlaygroundPreferences(theme as ThemeMode);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  useEffect(() => {
    // A `?theme=` override is a one-shot inspection aid; don't persist it.
    if (themeOverride()) return;
    savePreference('yuki-docs-theme', theme);
  }, [theme]);

  useEffect(() => {
    savePreference('yuki-docs-locale', locale);
    document.documentElement.lang = 'zh-CN';
  }, [locale]);

  const navigate = useCallback((hash: string) => {
    if (window.location.hash === hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = hash;
    setRoute(readRoute());
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const section = new URLSearchParams(window.location.hash.split('?')[1]).get('section');
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' });
  }, [route]);

  const doc = route.kind === 'doc' ? findPage(route.slug) : undefined;

  const { prev, next } = useMemo(() => {
    if (!doc) return { prev: undefined, next: undefined };
    const sameGroup = pages.filter((page) => page.group === doc.group);
    const index = sameGroup.findIndex((page) => page.slug === doc.slug);
    return { prev: index > 0 ? sameGroup[index - 1] : undefined, next: sameGroup[index + 1] };
  }, [doc]);

  useEffect(() => {
    document.title = doc ? `${doc.title} · Yuki UI` : route.kind === 'tokens' ? '设计令牌 · Yuki UI' : 'Yuki UI · 静谧的界面语言';
  }, [doc, route.kind]);

  let content: ReactNode;
  if (route.kind === 'tokens') {
    content = <TokensPage preferences={playground.preferences} onChange={playground.setPreferences} />;
  } else if (route.kind === 'doc' && doc) {
    content = <ComponentPage doc={doc} onNavigate={navigate} prev={prev} next={next} />;
  } else if (route.kind === 'missing') {
    content = (
      <div className="docs-article docs-missing">
        <h1>这一页还不存在</h1>
        <p>它可能仍在路上。回到概览，或者从左侧目录选择一个组件。</p>
        <button type="button" className="docs-text-btn" onClick={() => navigate('#/')}>
          回到概览
        </button>
      </div>
    );
  } else {
    content = <Home onNavigate={navigate} />;
  }

  return (
    <ConfigProvider theme={playground.theme} locale={locale as LocaleName}
      density={playground.preferences.density} motion={playground.preferences.motion}>
      <div className="docs-app">
        <Sidebar
          groups={navGroups}
          activeSlug={doc?.slug ?? null}
          route={route.kind === 'missing' ? 'home' : route.kind}
          query={query}
          onQueryChange={setQuery}
          onNavigate={navigate}
          open={menuOpen}
          onOpen={() => setMenuOpen(true)}
          onClose={() => setMenuOpen(false)}
        />
        <div className="docs-main">
          <TopBar
            onNavigate={navigate}
            title={doc?.title ?? (route.kind === 'tokens' ? '设计令牌' : '概览')}
            group={doc?.group}
            theme={theme}
            locale={locale}
            onThemeChange={setTheme}
            onLocaleChange={setLocale}
            menuOpen={menuOpen}
            onMenu={() => setMenuOpen(true)}
          />
          <main className="docs-content">{content}</main>
        </div>
      </div>
    </ConfigProvider>
  );
}
