import { Scrollbar, Text } from '@yuki-ui/react';

export default function CustomScrollbar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <div
        style={{
          blockSize: 180,
          inlineSize: 320,
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-md)',
        }}
      >
        <Scrollbar direction="both" visibility="hover" size={10} focusable style={{ blockSize: '100%' }}>
          <div style={{ inlineSize: 720, padding: 'var(--yuki-space-4)' }}>
            {Array.from({ length: 8 }, (_, index) => (
              <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-4)', whiteSpace: 'nowrap' }}>
                横向与纵向同时可滚动 · 悬停时显示滑块 · 滑块尺寸通过 size 定制 · 行 {index + 1}
              </Text>
            ))}
          </div>
        </Scrollbar>
      </div>
      <Text size="sm" tone="tertiary">
        direction="both" + visibility="hover" + size=10。
      </Text>
    </div>
  );
}
