import { useRef, useState } from 'react';
import { Affix, Button, Text } from '@yuki-ui/react';

export default function CustomAffix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Button size="sm" onClick={() => setOffsetTop(0)}>
          顶部对齐
        </Button>
        <Button size="sm" onClick={() => setOffsetTop(36)}>
          下移 36px
        </Button>
      </div>
      <div
        ref={containerRef}
        style={{
          blockSize: 200,
          overflow: 'auto',
          padding: 'var(--yuki-space-4)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-md)',
        }}
      >
        <Affix offsetTop={offsetTop} target={() => containerRef.current} onChange={() => undefined}>
          <div
            style={{
              padding: 'var(--yuki-space-2) var(--yuki-space-3)',
              background: 'var(--yuki-color-primary-subtle)',
              color: 'var(--yuki-color-primary)',
              borderRadius: 'var(--yuki-radius-md)',
            }}
          >
            <Text size="sm" weight="medium">
              当前 offsetTop = {offsetTop}
            </Text>
          </div>
        </Affix>
        {Array.from({ length: 7 }, (_, index) => (
          <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-5)' }}>
            滚动容器内的长内容段落 {index + 1}。
          </Text>
        ))}
      </div>
    </div>
  );
}
