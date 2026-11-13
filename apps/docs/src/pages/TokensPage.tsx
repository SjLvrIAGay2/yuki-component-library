import { useEffect, useMemo, useRef, useState, type RefObject, type ReactNode } from 'react';
import { Button, Divider, Icon, RadioGroup, Space, Switch, useResolvedTheme } from '@yuki-ui/react';
import { brandPalettes, defaultPlayground, type PlaygroundPreferences } from '../lib/playground';
import { tokenNames } from '../generated/stats';

const PALETTES: Array<{ name: string; steps: string[] }> = [
  { name: 'iris', steps: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] },
  { name: 'graphite', steps: ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] },
  { name: 'emerald', steps: ['50', '100', '200', '400', '500', '600'] },
  { name: 'amber', steps: ['50', '100', '200', '400', '500', '600'] },
  { name: 'red', steps: ['50', '100', '200', '400', '500', '600'] },
  { name: 'cyan', steps: ['50', '100', '200', '400', '500', '600'] },
];

const SURFACES = ['canvas', 'surface', 'elevated', 'subtle', 'muted', 'hover', 'active', 'disabled', 'inverse', 'overlay'];
const TEXT_TOKENS = ['', '-secondary', '-tertiary', '-placeholder', '-disabled', '-inverse', '-link'];
const BORDERS = ['', '-subtle', '-strong', '-inverse'];
const STATUS = ['primary', 'success', 'warning', 'danger', 'info'];
const FONT_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
const SPACES = ['0', '0-5', '1', '1-5', '2', '2-5', '3', '3-5', '4', '5', '6', '7', '8', '9', '10', '12', '14', '16', '20', '24'];
const RADII = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];
const SHADOWS = ['xs', 'sm', 'md', 'lg', 'xl', 'inner'];
const DURATIONS = ['instant', 'fast', 'base', 'slow', 'slower'];
const EASINGS = ['standard', 'enter', 'exit', 'bounce'];
const CONTROL_HEIGHTS = ['xs', 'sm', 'md', 'lg', 'xl'];

function useTokenValues(root: RefObject<HTMLDivElement>, dependency: string): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const style = getComputedStyle(root.current ?? document.documentElement);
    const next: Record<string, string> = {};
    for (const token of tokenNames) next[token] = style.getPropertyValue(token).trim();
    setValues(next);
  }, [root, dependency]);
  return values;
}

interface SwatchProps {
  token: string;
  value?: string;
  sample?: string;
  color?: string;
}

function Swatch({ token, value, sample, color }: SwatchProps) {
  return (
    <div className="token-swatch">
      <span
        className="token-swatch__chip"
        style={{ background: color
            ? (color.endsWith('-inverse') ? 'var(--yuki-color-bg-inverse)' : 'var(--yuki-color-bg-surface)')
            : `var(${token})`,
          color: color ? `var(${color})` : undefined }}
      >
        {sample}
      </span>
      <code className="token-swatch__name">{token.replace('--yuki-', '')}</code>
      <span className="token-swatch__value">{value || '—'}</span>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="docs-section tokens-section">
      <div className="docs-section__head">
        <h2>{title}</h2>
        {hint ? <p>{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

interface TokensPageProps {
  preferences: PlaygroundPreferences;
  onChange: (preferences: PlaygroundPreferences) => void;
}

export function TokensPage({ preferences, onChange }: TokensPageProps) {
  const resolvedTheme = useResolvedTheme();
  const root = useRef<HTMLDivElement>(null);
  const values = useTokenValues(root, [resolvedTheme, preferences.palette, preferences.density, preferences.radius, preferences.motion].join('/'));
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? tokenNames.filter((token) => token.includes(needle)) : tokenNames;
  }, [query]);

  return (
    <div className="docs-article docs-tokens" ref={root}>
      <header className="docs-article__head">
        <div className="docs-article__meta">
          <span className="docs-chip docs-chip--primary">设计基调</span>
          <code className="docs-article__slug">styles/tokens.css</code>
        </div>
        <h1 className="docs-article__title">设计令牌</h1>
        <p className="docs-article__desc">
          冷石墨中性色、单一鸢尾紫强调色、4px 节奏与发丝边框。组件 CSS 只允许消费这些变量：
          换一套主题，等于换一份令牌。当前主题为 <strong>{resolvedTheme === 'dark' ? '深色' : '浅色'}</strong>。
        </p>
      </header>

      <div className="tokens-note">
        <Icon name="info" size="0.95rem" />
        <p>
          所有令牌都挂在 <code>:root</code> 上，并以 <code>data-yuki-theme</code> 切换明暗、以{' '}
          <code>data-yuki-brand=&quot;custom&quot;</code> 从品牌色派生整套语义色。修改
          <code> --yuki-color-primary </code>即可让 primary 色系的 hover、subtle、border、focus ring 同步变化。
        </p>
      </div>

      <Section title="主题预览">
        <div className="tokens-playground">
          <div>
            <strong>品牌色</strong>
            <Space wrap role="group" aria-label="品牌色">
              {(Object.keys(brandPalettes) as Array<keyof typeof brandPalettes>).map((name) => (
                <Button key={name} size="sm" variant={name === preferences.palette ? 'soft' : 'outline'}
                  aria-pressed={name === preferences.palette} onClick={() => onChange({ ...preferences, palette: name })}
                  startIcon={<span className="tokens-playground__color" style={{ background: brandPalettes[name][resolvedTheme] }} />}>
                  {brandPalettes[name].label}
                </Button>
              ))}
            </Space>
          </div>
          <div>
            <strong>基础圆角</strong>
            <RadioGroup label="基础圆角" value={preferences.radius}
              options={[4, 8, 12].map(value => ({ value, label: value + ' px' }))}
              onChange={(value) => onChange({ ...preferences, radius: value as PlaygroundPreferences['radius'] })} />
          </div>
          <Space wrap size="4">
            <Space size="2"><Switch aria-label="紧凑布局" checked={preferences.density === 'compact'}
              onChange={(checked) => onChange({ ...preferences, density: checked ? 'compact' : 'comfortable' })} /><span>紧凑布局</span></Space>
            <Space size="2"><Switch aria-label="启用动效" checked={preferences.motion}
              onChange={(motion) => onChange({ ...preferences, motion })} /><span>启用动效</span></Space>
            <Button variant="ghost" size="sm" onClick={() => onChange(defaultPlayground)}>恢复默认</Button>
          </Space>
        </div>
      </Section>

      <Section title="表面与背景" hint="从画布到浮层，每一个层级都有明确用途。">
        <div className="token-grid">
          {SURFACES.map((name) => (
            <Swatch key={name} token={`--yuki-color-bg-${name}`} value={values[`--yuki-color-bg-${name}`]} />
          ))}
        </div>
      </Section>

      <Section title="文字" hint="层级靠色阶而非字号堆叠；正文对比度满足 AA。">
        <div className="token-grid token-grid--text">
          {TEXT_TOKENS.map((name) => (
            <Swatch
              key={name || 'base'}
              token={`--yuki-color-text${name}`}
              value={values[`--yuki-color-text${name}`]}
              sample="Aa 静"
              color={`--yuki-color-text${name}`}
            />
          ))}
        </div>
      </Section>

      <Section title="边框与分隔线" hint="发丝边框是这个语言里的标点符号。">
        <div className="token-grid">
          {BORDERS.map((name) => (
            <Swatch key={name || 'base'} token={`--yuki-color-border${name}`} value={values[`--yuki-color-border${name}`]} />
          ))}
        </div>
      </Section>

      <Section title="状态色" hint="每个状态包含 base / hover / subtle / border / contrast，用于文字与底色成对出现。">
        <div className="token-status-grid">
          {STATUS.map((name) => (
            <div className="token-status" key={name}>
              <div className="token-status__bar">
                <span style={{ background: `var(--yuki-color-${name})` }} />
                <span style={{ background: `var(--yuki-color-${name}-hover)` }} />
                <span style={{ background: `var(--yuki-color-${name}-subtle)` }} />
                <span style={{ background: `var(--yuki-color-${name}-contrast)` }} />
              </div>
              <div className="token-status__meta">
                <strong>{name}</strong>
                <code>{values[`--yuki-color-${name}`] || '—'}</code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="原始色板" hint="组件不得直接消费原始色板，语义层才是公共 API。">
        {PALETTES.map((palette) => (
          <div className="token-palette" key={palette.name}>
            <span className="token-palette__name">{palette.name}</span>
            <div className="token-palette__steps">
              {palette.steps.map((step) => {
                const token = `--yuki-${palette.name}-${step}`;
                return (
                  <div className="token-palette__step" key={step}>
                    <span style={{ background: `var(${token})` }} />
                    <code>{step}</code>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      <Section title="字号阶梯" hint="1.25 倍上行的紧凑阶梯，正文 14px，辅助 12/13px。">
        <div className="token-type-scale">
          {FONT_SIZES.map((name) => (
            <div className="token-type-row" key={name}>
              <code>font-size-{name}</code>
              <span style={{ fontSize: `var(--yuki-font-size-${name})` }}>静谧的界面语言</span>
              <span className="token-type-row__value">{values[`--yuki-font-size-${name}`] || '—'}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="间距" hint="4px 基准，命名与数值解耦，便于整体收紧或放大密度。">
        <div className="token-space-list">
          {SPACES.map((name) => (
            <div className="token-space-row" key={name}>
              <code>space-{name}</code>
              <span className="token-space-row__bar" style={{ width: `var(--yuki-space-${name})` }} />
              <span className="token-space-row__value">{values[`--yuki-space-${name}`] || '0'}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="圆角与阴影" hint="圆角克制，阴影只用于真正浮起的层。">
        <div className="token-radius-grid">
          {RADII.map((name) => (
            <div className="token-radius" key={name}>
              <span style={{ borderRadius: `var(--yuki-radius-${name})` }} />
              <code>radius-{name}</code>
              <em>{values[`--yuki-radius-${name}`] || '—'}</em>
            </div>
          ))}
        </div>
        <div className="token-shadow-grid">
          {SHADOWS.map((name) => (
            <div className="token-shadow" key={name}>
              <span style={{ boxShadow: `var(--yuki-shadow-${name})` }} />
              <code>shadow-{name}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="控件尺寸" hint="size=sm/md/lg 映射到同一组高度令牌，保持跨组件一致。">
        <div className="token-heights">
          {CONTROL_HEIGHTS.map((name) => (
            <div className="token-height" key={name}>
              <span style={{ height: `var(--yuki-control-height-${name})` }} />
              <code>control-height-{name}</code>
              <em>{values[`--yuki-control-height-${name}`] || '—'}</em>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      <Section title="动效" hint="统一时长与缓动；系统开启“减少动态效果”时，所有时长自动归零。">
        <div className="token-motion-grid">
          {DURATIONS.map((name) => (
            <div className="token-motion" key={name}>
              <div className="token-motion__track">
                <span style={{ animationDuration: `var(--yuki-duration-${name})` }} />
              </div>
              <code>duration-{name}</code>
              <em>{values[`--yuki-duration-${name}`] || '—'}</em>
            </div>
          ))}
        </div>
        <div className="token-easing-grid">
          {EASINGS.map((name) => (
            <div className="token-easing" key={name}>
              <code>easing-{name}</code>
              <em>{values[`--yuki-easing-${name}`] || '—'}</em>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="全部令牌"
        hint={`共 ${tokenNames.length} 个变量，按当前主题解析为实际计算值；组件 CSS 只允许引用这里的前缀。`}
      >
        <label className="token-search">
          <Icon name="search" size="0.9rem" />
          <input
            type="search"
            value={query}
            placeholder="过滤令牌，例如 space、border、duration"
            onChange={(event) => setQuery(event.target.value)}
            aria-label="过滤设计令牌"
          />
          <span className="token-search__count">{filtered.length}</span>
        </label>
        <div className="token-table" role="table" aria-label="全部设计令牌">
          <div className="token-table__head" role="row">
            <span role="columnheader">Token</span>
            <span role="columnheader">计算值</span>
          </div>
          {filtered.map((token) => (
            <div className="token-table__row" role="row" key={token}>
              <code role="cell">{token}</code>
              <span role="cell" title={values[token]}>
                {values[token] || '—'}
              </span>
            </div>
          ))}
          {filtered.length === 0 ? <p className="token-table__empty">没有匹配的令牌。</p> : null}
        </div>
      </Section>
    </div>
  );
}
