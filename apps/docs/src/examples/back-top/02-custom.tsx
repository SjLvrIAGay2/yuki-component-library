import { useRef, useState } from 'react';
import { BackTop, Button, Text } from '@yuki-ui/react';

export default function CustomBackTop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [threshold, setThreshold] = useState(120);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Button size="sm" onClick={() => setThreshold(0)}>
          立即出现
        </Button>
        <Button size="sm" onClick={() => setThreshold(120)}>
          滚动 120px 后出现
        </Button>
        <Button size="sm" onClick={() => setThreshold(400)}>
          滚动 400px 后出现
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
        {Array.from({ length: 10 }, (_, index) => (
          <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-4)' }}>
            自定义阈值与内容的示例段落 {index + 1}。
          </Text>
        ))}
      </div>

      <BackTop
        visibilityHeight={threshold}
        target={() => containerRef.current}
        size="lg"
        onClick={() => undefined}
      >
        顶部
      </BackTop>
    </div>
  );
}
