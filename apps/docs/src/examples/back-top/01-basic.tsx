import { useRef } from 'react';
import { BackTop, Text } from '@yuki-ui/react';

export default function BasicBackTop() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <div
        ref={containerRef}
        style={{
          blockSize: 220,
          overflow: 'auto',
          padding: 'var(--yuki-space-4)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-md)',
        }}
      >
        {Array.from({ length: 12 }, (_, index) => (
          <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-4)' }}>
            第 {index + 1} 段内容：滚动超过阈值后，右下角会出现回到顶部按钮。
          </Text>
        ))}
      </div>
      <BackTop visibilityHeight={160} target={() => containerRef.current} />
    </div>
  );
}
