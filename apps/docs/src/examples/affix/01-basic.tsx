import { useRef } from 'react';
import { Affix, Text } from '@yuki-ui/react';

export default function BasicAffix() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
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
      <Affix offsetTop={8} target={() => containerRef.current}>
        <div
          style={{
            padding: 'var(--yuki-space-2) var(--yuki-space-3)',
            background: 'var(--yuki-color-bg-elevated)',
            border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
            borderRadius: 'var(--yuki-radius-md)',
          }}
        >
          <Text size="sm" weight="medium">
            固定操作条
          </Text>
        </div>
      </Affix>
      {Array.from({ length: 8 }, (_, index) => (
        <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-5)' }}>
          向下滚动，操作条会在距顶部 8px 处固定，并为原位置保留占位。
        </Text>
      ))}
    </div>
  );
}
