import { useRef } from 'react';
import { Anchor, Text } from '@yuki-ui/react';

const items = [
  { key: 'intro', href: '#intro', title: '介绍' },
  { key: 'usage', href: '#usage', title: '基础用法' },
  { key: 'api', href: '#api', title: 'API' },
  { key: 'faq', href: '#faq', title: '常见问题' },
];

const sections: Record<string, string> = {
  intro: '锚点会随着内容滚动自动高亮，点击可平滑滚动到对应标题。',
  usage: '将 Anchor 放在内容侧边，传入 items 即可。',
  api: '支持 offsetTop、targetOffset、getContainer 等滚动控制参数。',
  faq: '在固定头部布局中，把 offsetTop 设置为头部高度即可避开遮挡。',
};

export default function BasicAnchor() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', gap: 'var(--yuki-space-6)' }}>
      <Anchor
        items={items}
        getContainer={() => containerRef.current}
        offsetTop={8}
        style={{ inlineSize: 160, flex: 'none' }}
      />
      <div
        ref={containerRef}
        style={{
          blockSize: 260,
          overflow: 'auto',
          flex: 1,
          paddingInlineEnd: 'var(--yuki-space-4)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-md)',
        }}
      >
        {items.map((item) => (
          <section key={item.key} id={item.key} style={{ padding: 'var(--yuki-space-4)', minBlockSize: 180 }}>
            <h3 style={{ marginBlockEnd: 'var(--yuki-space-2)' }}>{item.title}</h3>
            <Text size="sm" tone="secondary">
              {sections[item.key]}
            </Text>
          </section>
        ))}
      </div>
    </div>
  );
}
