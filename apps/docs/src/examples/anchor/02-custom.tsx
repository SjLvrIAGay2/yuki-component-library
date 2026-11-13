import { useRef, useState } from 'react';
import { Anchor, Text } from '@yuki-ui/react';

const items = [
  { key: 'overview', href: '#overview', title: '概览' },
  {
    key: 'guide',
    href: '#guide',
    title: '指南',
    children: [
      { key: 'install', href: '#install', title: '安装' },
      { key: 'theme', href: '#theme', title: '主题' },
    ],
  },
  { key: 'changelog', href: '#changelog', title: '更新日志' },
];

export default function CustomAnchor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('overview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <div style={{ display: 'flex', gap: 'var(--yuki-space-6)' }}>
        <Anchor
          items={items}
          activeKey={active}
          onChange={(key) => setActive(key)}
          getContainer={() => containerRef.current}
          offsetTop={0}
          targetOffset={12}
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
          {['overview', 'install', 'theme', 'changelog'].map((key) => (
            <section key={key} id={key} style={{ padding: 'var(--yuki-space-4)', minBlockSize: 200 }}>
              <h3 style={{ marginBlockEnd: 'var(--yuki-space-2)' }}>{key}</h3>
              <Text size="sm" tone="secondary">
                受控 activeKey 允许把滚动位置同步到外部状态。
              </Text>
            </section>
          ))}
        </div>
      </div>
      <Text size="sm" tone="tertiary">
        当前激活：{active}
      </Text>
    </div>
  );
}
