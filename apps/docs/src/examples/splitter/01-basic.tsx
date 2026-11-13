import { Splitter, Text } from '@yuki-ui/react';

const paneStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontSize: 'var(--yuki-font-size-sm)',
  color: 'var(--yuki-color-text-secondary)',
};

export default function BasicSplitter() {
  return (
    <Splitter
      defaultSize={38}
      style={{
        height: '11rem',
        border: '1px solid var(--yuki-color-border)',
        borderRadius: 'var(--yuki-radius-md)',
        overflow: 'hidden',
      }}
    >
      <div style={{ ...paneStyle, background: 'var(--yuki-color-bg-subtle)' }}>
        <Text size="sm">左面板 · 目录</Text>
      </div>
      <div style={paneStyle}>
        <Text size="sm" tone="secondary">
          右面板 · 内容
        </Text>
      </div>
    </Splitter>
  );
}
