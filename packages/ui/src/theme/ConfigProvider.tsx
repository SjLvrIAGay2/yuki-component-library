import type { StyleProperties, WithStyle } from '../styles/properties';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { setGlobalTheme } from './global-theme';
import { EscapeScope } from '../internal/escapeScope';
import { mergeProps } from '../internal/merge-props';
import type { AnimationOptions } from '../animation';
import type { ComponentDefaults } from './defaults';
import type { ThemeTokens } from './tokens';
import { componentMessages, type LocaleMessages } from '../locale/messages';
import { cx } from '../internal/cx';
import { useMediaQuery } from '../hooks/useMediaQuery';
import {
  localeKey,
  normalizeLocale,
  translate,
  type Fallback,
  type LocaleConfig,
  type LocaleInput,
} from '../locale/translate';

export type Size = 'sm' | 'md' | 'lg';
export type ThemeMode = 'light' | 'dark' | 'system';

export type Density = 'comfortable' | 'compact';
export type MotionPreference = 'system' | 'none';
export type Theme = ThemeMode;

export interface ThemeConfig {
  /** Light / dark / follow the operating system. Defaults to light. */
  mode?: ThemeMode;
  /** Any CSS color. The whole primary ramp is derived with color-mix(). */
  primaryColor?: string;
  /** Escape hatch for advanced brands: any --yuki-* variable override. */
  tokens?: ThemeTokens;
}

export interface ConfigContextValue {
  size: Size;
  density: Density;
  components: ComponentDefaults;
  animation?: AnimationOptions | false;
  messages: LocaleMessages;
  themeVars: StyleProperties;
  motion: boolean;
  locale: LocaleConfig;
  theme: ThemeConfig;
  resolvedTheme: 'light' | 'dark';
  t: (
    key: string,
    fallback?: Fallback,
    vars?: Record<string, string | number>,
  ) => string;
  getPopupContainer: (trigger?: HTMLElement | null) => HTMLElement;
}

const fallbackContainer = (): HTMLElement =>
  typeof document !== 'undefined' ? document.body : (null as unknown as HTMLElement);

const defaultContext: ConfigContextValue = {
  size: 'md',
  density: 'comfortable',
  components: {},
  messages: componentMessages['zh-CN'],
  themeVars: {},
  motion: true,
  locale: { name: 'zh-CN' },
  theme: {},
  resolvedTheme: 'light',
  t: (key, fallback, vars) =>
    translate(key, { locale: 'zh-CN' }, fallback, vars),
  getPopupContainer: fallbackContainer,
};

const ConfigContext = createContext<ConfigContextValue>(defaultContext);

export interface ConfigProviderProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
  children: ReactNode;
  /** Theme mode, brand color and token overrides. */
  theme?: ThemeConfig;
  /** 'zh-CN' | 'en-US' | custom { name, messages }. */
  locale?: LocaleInput;
  /** Default size for every component that supports it. */
  size?: Size;
  /** Master switch for animations (also listens to prefers-reduced-motion). */
  motion?: boolean;
  /** Default spacing and control density; explicit size props take precedence. */
  density?: Density;
  animation?: AnimationOptions | false;
  components?: ComponentDefaults;
  /** Override the popup mount node (Select, Tooltip, Modal, …). */
  getPopupContainer?: (trigger: HTMLElement | null) => HTMLElement;
  /** Apply theme attributes to <html> so the whole document follows. */
  global?: boolean;
  className?: string;
  style?: StyleProperties;
  /** Extra class names for the portal host (advanced). */
  portalClassName?: string;
}

/**
 * Global configuration for Yuki UI: theme, locale, size, motion and overlay
 * mounting. The provider owns a theme-aware portal host, so overlays inherit
 * CSS variables even when rendered outside the component tree.
 */
export function ConfigProvider({
  children,
  theme: requestedTheme,
  locale: localeInput,
  size: requestedSize,
  motion: requestedMotion,
  density: requestedDensity,
  components: requestedComponents,
  animation: requestedAnimation,
  getPopupContainer: getPopupContainerProp,
  global: requestedGlobal,
  className,
  style,
  portalClassName,
  ...rootProps
}: ConfigProviderProps) {
  const parent = useConfig();
  const global = requestedGlobal ?? parent === defaultContext;
  const motion = requestedMotion ?? parent.motion;
  const density = requestedDensity ?? parent.density;
  const size = requestedSize ?? (requestedDensity ? (density === 'compact' ? 'sm' : 'md') : parent.size);
  const theme = useMemo(
    () => requestedTheme ? mergeProps(parent.theme, requestedTheme) : parent.theme,
    [parent.theme, requestedTheme],
  );
  const components = useMemo(
    () => requestedComponents ? mergeProps(parent.components, requestedComponents) : parent.components,
    [parent.components, requestedComponents],
  );
  const animation = useMemo(
    () => requestedAnimation === undefined || requestedAnimation === false
      ? (requestedAnimation ?? parent.animation)
      : { ...(parent.animation || {}), ...requestedAnimation },
    [parent.animation, requestedAnimation],
  );
  const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = theme.mode ?? 'light';
  const resolvedTheme: 'light' | 'dark' =
    mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;

  const [locale, messages] = useLocaleConfig(parent.locale, localeInput);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

  const getPopupContainer = useCallback<ConfigContextValue['getPopupContainer']>(
    (trigger) => {
      if (getPopupContainerProp) return getPopupContainerProp(trigger ?? null);
      return portalHost ?? (typeof document !== 'undefined' ? document.body : fallbackContainer());
    },
    [getPopupContainerProp, portalHost],
  );

  const themeVars = useMemo(() => {
    const vars: Record<string, string | number> = {};
    if (theme.primaryColor) {
      vars['--yuki-color-primary'] = theme.primaryColor;
      vars['--yuki-color-text-link'] = theme.primaryColor;
    }
    if (theme.tokens) {
      for (const [key, value] of Object.entries(theme.tokens)) {
        const token = key.startsWith('--') ? key : `--yuki-${key}`;
        vars[token] = value;
      }
    }
    return vars;
  }, [theme.primaryColor, theme.tokens]);

  const t = useCallback<ConfigContextValue['t']>(
    (key, fallback, vars) =>
      translate(key, { locale: locale.name, messages: locale.messages }, fallback, vars),
    [locale],
  );

  const contextValue = useMemo<ConfigContextValue>(
    () => ({
      size,
      motion,
      locale,
      theme,
      resolvedTheme,
      themeVars,
      density,
      components,
      animation,
      messages,
      t,
      getPopupContainer,
    }),
    [size, motion, locale, theme, resolvedTheme, themeVars, density, components, animation, messages, t, getPopupContainer],
  );

  const [globalOwner] = useState(() => Symbol('yuki-global-theme'));
  useEffect(() => {
    if (!global) return;
    setGlobalTheme(document.documentElement, globalOwner, {
      attrs: {
        'data-yuki-theme': resolvedTheme,
        'data-yuki-brand': theme.primaryColor ? 'custom' : 'default',
        'data-yuki-motion': motion ? 'on' : 'off',
      },
      tokens: themeVars,
    });
  }, [global, globalOwner, resolvedTheme, motion, theme.primaryColor, themeVars]);

  // Keep registration stable on prop changes; release only when leaving global mode.
  useEffect(() => {
    if (!global) return;
    const root = document.documentElement;
    return () => setGlobalTheme(root, globalOwner, null);
  }, [global, globalOwner]);

  return (
    <ConfigContext.Provider value={contextValue}>
      <div
        {...rootProps}
        data-yuki-density={density}
        className={cx('yuki-ui-root', 'yuki-config-provider', className)}
        data-yuki-theme={resolvedTheme}
        data-yuki-motion={motion ? 'on' : 'off'}
        data-yuki-brand={theme.primaryColor ? 'custom' : 'default'}
        data-yuki-size={size}
        style={{ ...themeVars, ...style }}
      >
        {children}
        <div
          ref={setPortalHost}
          className={cx('yuki-portal-host', portalClassName)}
          data-yuki-portal=""
          style={{ display: 'contents' }}
        />
      </div>
    </ConfigContext.Provider>
  );
}

/** Read the nearest ConfigProvider. Returns sensible defaults outside one. */
export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext);
}

/** Read the active locale + translator. */
export function useLocale() {
  const { locale, messages, t } = useConfig();
  return { locale, messages, t };
}

/** Merge a component-level size prop with the provider default. */
export function useComponentSize(size?: Size): Size {
  const config = useConfig();
  return size ?? config.size ?? 'md';
}

/** Inherit a form or field's size without adding a DOM wrapper or moving portals. */
export function ComponentSizeScope({ size, children }: { size?: Size; children: ReactNode }) {
  const parent = useConfig();
  const context = useMemo(() => size && size !== parent.size ? { ...parent, size } : parent, [parent, size]);
  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>;
}

/** Resolved light/dark mode, accounting for 'system'. */
export function useResolvedTheme(): 'light' | 'dark' {
  return useConfig().resolvedTheme;
}


function useLocaleConfig(parent: LocaleConfig, input?: LocaleInput) {
  return useMemo(() => {
    const requested = input === undefined ? parent : normalizeLocale(input);
    const overrides = {
      ...(requested.name === parent.name ? parent.messages : {}),
      ...requested.messages,
    };
    const locale = { name: requested.name, messages: overrides };
    const messages = { ...componentMessages[localeKey(locale.name)], ...overrides };
    return [locale, messages] as const;
  }, [parent, input]);
}

export interface LocaleProviderProps {
  children: ReactNode;
  locale?: LocaleInput;
  messages?: Partial<LocaleMessages> & Record<string, string | undefined>;
}

/** Override component labels without introducing a layout wrapper or a second locale context. */
export function LocaleProvider({ children, locale: input, messages: overrides }: LocaleProviderProps) {
  const parent = useConfig();
  const requested = useMemo(() => {
    const locale = input === undefined ? parent.locale : normalizeLocale(input);
    const messages: Record<string, string> = { ...locale.messages };
    for (const [key, value] of Object.entries(overrides ?? {})) {
      if (value !== undefined) messages[key] = value;
    }
    return { name: locale.name, messages };
  }, [parent.locale, input, overrides]);
  const [locale, messages] = useLocaleConfig(parent.locale, requested);
  const context = useMemo<ConfigContextValue>(() => ({
    ...parent, locale, messages,
    t: (key, fallback, vars) => translate(key, { locale: locale.name, messages: locale.messages }, fallback, vars),
  }), [parent, locale, messages]);
  return <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>;
}

export interface ThemeProviderProps extends Omit<ConfigProviderProps, 'theme' | 'motion'> {
  theme?: ThemeMode;
  tokens?: ThemeTokens;
  motion?: MotionPreference;
}

/** Scoped shorthand for configuring a subtree. Uses the same context and portal host as ConfigProvider. */
export function ThemeProvider({ theme, tokens, motion, ...props }: ThemeProviderProps) {
  return (
    <ConfigProvider
      global={false}
      {...props}
      theme={{ mode: theme, tokens }}
      motion={motion === undefined ? undefined : motion !== 'none'}
    />
  );
}

export type ThemeContextValue = ReturnType<typeof useTheme>;

export function useTheme() {
  const config = useConfig();
  return {
    theme: config.resolvedTheme, tokens: config.theme.tokens,
    density: config.density, motion: config.motion ? 'system' as const : 'none' as const,
    animation: config.animation, components: config.components,
  };
}

export function useComponentDefaults<Props extends object>(name: keyof ComponentDefaults, props: Props): Props {
  const defaults = useConfig().components[name];
  return defaults ? mergeProps(defaults as Partial<Props>, props) : props;
}

/** Supply the scope attributes when a custom portal target lives outside the provider. */
export function usePortalTheme() {
  const { resolvedTheme, theme, motion, density, themeVars } = useConfig();
  return {
    className: 'yuki-ui-root',
    'data-yuki-theme': resolvedTheme,
    'data-yuki-brand': theme.primaryColor ? 'custom' : 'default',
    'data-yuki-density': density,
    'data-yuki-motion': motion ? 'on' : 'off',
    style: themeVars,
  } as const;
}


/** Keep descendant overlays in the dialog's focus and pointer boundary. */
export function DialogPopupScope({ host, children }: { host: HTMLElement | null; children: ReactNode }) {
  const parent = useConfig();
  const context = useMemo(() => ({ ...parent, getPopupContainer: host ? () => host : parent.getPopupContainer }), [parent, host]);
  return (
    <EscapeScope.Provider value={host}>
      <ConfigContext.Provider value={context}>{children}</ConfigContext.Provider>
    </EscapeScope.Provider>
  );
}
