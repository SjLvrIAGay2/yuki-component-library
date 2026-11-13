import { Container, Text } from '@yuki-ui/react';

const boxStyle: React.CSSProperties = {
  padding: 'var(--yuki-space-3)',
  borderRadius: 'var(--yuki-radius-sm)',
  background: 'var(--yuki-color-bg-subtle)',
  border: '1px solid var(--yuki-color-border-subtle)',
  textAlign: 'center',
  fontSize: 'var(--yuki-font-size-sm)',
  color: 'var(--yuki-color-text-secondary)',
};

export default function CustomContainer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Container size="sm" gutter="2">
        <div style={boxStyle}>size="sm" · gutter="2"</div>
      </Container>
      <Container size="md" gutter="3">
        <div style={boxStyle}>size="md" · gutter="3"</div>
      </Container>
      <Container size="xl" gutter="4">
        <div style={boxStyle}>size="xl" · gutter="4"</div>
      </Container>
      <Container fluid gutter="5">
        <div style={boxStyle}>fluid · gutter="5"（只保留边距）</div>
      </Container>
      <Container size="md" center={false} gutter="4">
        <div style={{ ...boxStyle, textAlign: 'left' }}>center=false · 靠左对齐</div>
      </Container>
      <Text size="xs" tone="tertiary">
        最大宽度取自断点 token，而不是任意像素；窄屏时边距会自动收敛。
      </Text>
    </div>
  );
}
