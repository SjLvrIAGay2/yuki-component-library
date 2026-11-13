import { Button, Icon } from '@yuki-ui/react';
import { dependencyCount, componentCount, tokenCount } from '../generated/stats';
import { navGroups, pages } from '../lib/content';
import { exampleCount } from '../lib/examples';

export interface HomeProps {
  onNavigate: (hash: string) => void;
}

const FEATURES: Array<{ icon: 'palette' | 'layers' | 'shield' | 'code'; title: string; body: string }> = [
  {
    icon: 'palette',
    title: '先有语言，再有组件',
    body: '冷石墨中性色与单一鸢尾紫强调色，4px 节奏、发丝边框、克制的圆角与阴影。所有视觉值都来自一份设计令牌。',
  },
  {
    icon: 'layers',
    title: '四层定制，不改源码',
    body: '全局 token → 组件 token → classNames / styles 插槽 → render prop。品牌色、密度、文案都能从外部接管。',
  },
  {
    icon: 'shield',
    title: '键盘与读屏可用',
    body: '焦点陷阱、aria 关联、对比度达标的色调组合，以及尊重 prefers-reduced-motion 的统一动效节奏。',
  },
  {
    icon: 'code',
    title: '类型完整，按需加载',
    body: 'Table、Select 等组件提供完整泛型；ESM 保留模块结构，支持按组件导入，文档解析器按需加载。',
  },
];

export function Home({ onNavigate }: HomeProps) {
  const firstPage = pages[0];
  return (
    <div className="docs-home">
      <section className="docs-hero">
        <span className="docs-hero__eyebrow">
          <Icon name="sparkles" size="0.875rem" /> YuKI · still water, precise interface
        </span>
        <h1 className="docs-hero__title">
          静谧的
          <br />
          界面语言。
        </h1>
        <p className="docs-hero__lead">
          一套从零构建的 React 组件库。以设计令牌为唯一视觉真理，覆盖表单、数据展示、反馈与导航，
          每个组件都保留 token、类名、插槽与 render prop 四层定制能力。
        </p>
        <div className="docs-hero__actions">
          {firstPage ? (
            <Button
              size="lg"
              endIcon={<Icon name="arrow-right" />}
              onClick={() => onNavigate(`#/c/${firstPage.slug}`)}
            >
              开始阅读文档
            </Button>
          ) : null}
          <Button variant="outline" size="lg" startIcon={<Icon name="palette" />} onClick={() => onNavigate('#/tokens')}>
            浏览设计令牌
          </Button>
        </div>
        <dl className="docs-stats">
          <div>
            <dt>组件</dt>
            <dd>{componentCount}</dd>
          </div>
          <div>
            <dt>实时示例</dt>
            <dd>{exampleCount()}</dd>
          </div>
          <div>
            <dt>设计令牌</dt>
            <dd>{tokenCount}</dd>
          </div>
          <div>
            <dt>运行时依赖</dt>
            <dd>{dependencyCount}</dd>
          </div>
        </dl>
      </section>

      <section className="docs-section">
        <div className="docs-section__head">
          <h2>设计原则</h2>
          <p>少一点噪音，多一点结构。</p>
        </div>
        <div className="docs-features">
          {FEATURES.map((feature) => (
            <article className="docs-feature" key={feature.title}>
              <span className="docs-feature__icon">
                <Icon name={feature.icon} size="1.05rem" />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <div className="docs-section__head">
          <h2>组件地图</h2>
          <p>按场景分组，覆盖真实项目中的绝大多数界面需求。</p>
        </div>
        <div className="docs-groups">
          {navGroups.map((group) => (
            <article className="docs-group" key={group.title}>
              <header>
                <h3>{group.title}</h3>
                <span className="docs-chip">{group.items.length} 个</span>
              </header>
              <div className="docs-group__links">
                {group.items.map((page) => (
                  <button
                    key={page.slug}
                    type="button"
                    className="docs-group__link"
                    onClick={() => onNavigate(`#/c/${page.slug}`)}
                  >
                    {page.title}
                    <Icon name="chevron-right" size="0.75rem" />
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="docs-cta">
        <div>
          <h2>从一个组件开始，验证整套语言。</h2>
          <p>每个文档页都包含用途、API 表、定制点清单、无障碍说明与可交互示例。</p>
        </div>
        <Button
          tone="primary"
          size="lg"
          endIcon={<Icon name="arrow-right" />}
          onClick={() => onNavigate('#/tokens')}
        >
          查看令牌
        </Button>
      </section>
    </div>
  );
}
