import { useState } from 'react';
import { Icon, Splitter, Text } from '@yuki-ui/react';

const paneStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontSize: 'var(--yuki-font-size-sm)',
  color: 'var(--yuki-color-text-secondary)',
};

export default function CustomSplitter() {
  const [size, setSize] = useState(50);
  const [ended, setEnded] = useState(50);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Splitter
        direction="vertical"
        size={size}
        min={20}
        max={80}
        step={2}
        onResize={setSize}
        onResizeEnd={setEnded}
        handle={
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--yuki-space-1)',
              height: 'var(--yuki-space-4)',
              color: 'var(--yuki-color-text-tertiary)',
              background: 'var(--yuki-color-bg-subtle)',
            }}
          >
            <Icon name="grip-vertical" size="0.75rem" />
          </span>
        }
        style={{
          height: '14rem',
          border: '1px solid var(--yuki-color-border)',
          borderRadius: 'var(--yuki-radius-md)',
          overflow: 'hidden',
        }}
      >
        <div style={{ ...paneStyle, background: 'var(--yuki-color-bg-subtle)' }}>
          <Text size="sm">上方面板</Text>
        </div>
        <div style={paneStyle}>
          <Text size="sm" tone="secondary">
            下方面板
          </Text>
        </div>
      </Splitter>
      <Text size="xs" tone="tertiary">
        拖拽中 size = {Math.round(size)}% · 松手后提交值 = {Math.round(ended)}%
      </Text>
    </div>
  );
}
