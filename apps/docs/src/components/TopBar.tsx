import { Icon } from '@yuki-ui/react';

export type DocsTheme = 'light' | 'dark' | 'system';
export type DocsLocale = 'zh-CN' | 'en-US';

export interface TopBarProps {
  title: string;
  group?: string;
  theme: DocsTheme;
  locale: DocsLocale;
  onThemeChange: (theme: DocsTheme) => void;
  onLocaleChange: (locale: DocsLocale) => void;
  onMenu: () => void;
  menuOpen: boolean;
}

const THEME_ORDER: DocsTheme[] = ['light', 'dark', 'system'];
const THEME_META: Record<DocsTheme, { icon: 'sun' | 'moon' | 'monitor'; label: string }> = {
  light: { icon: 'sun', label: '浅色' },
  dark: { icon: 'moon', label: '深色' },
  system: { icon: 'monitor', label: '跟随系统' },
};

export function TopBar({
  title,
  group,
  theme,
  locale,
  onThemeChange,
  onLocaleChange,
  onMenu, menuOpen,
}: TopBarProps) {
  const meta = THEME_META[theme];
  const cycleTheme = () => {
    const index = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? 'light';
    onThemeChange(next);
  };

  return (
    <header className="docs-topbar">
      <button type="button" className="docs-icon-btn docs-menu-btn" onClick={onMenu} aria-controls="docs-navigation" aria-expanded={menuOpen} aria-label="打开导航">
        <Icon name="menu" size="1.05rem" />
      </button>
      <div className="docs-crumb">
        {group ? <span className="docs-crumb__group">{group}</span> : null}
        <span className="docs-crumb__title">{title}</span>
      </div>
      <div className="docs-topbar__actions">
        <button
          type="button"
          className="docs-theme-btn"
          onClick={cycleTheme}
          aria-label={`主题：${meta.label}，点击切换`}
          title={`主题：${meta.label}`}
        >
          <Icon name={meta.icon} size="0.95rem" />
          <span>{meta.label}</span>
        </button>
        <div className="docs-locale" role="group" aria-label="组件演示语言" title="组件演示语言">
          <button
            type="button"
            className={locale === 'zh-CN' ? 'docs-locale__btn docs-locale__btn--active' : 'docs-locale__btn'}
            onClick={() => onLocaleChange('zh-CN')}
          >
            中
          </button>
          <button
            type="button"
            className={locale === 'en-US' ? 'docs-locale__btn docs-locale__btn--active' : 'docs-locale__btn'}
            onClick={() => onLocaleChange('en-US')}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
