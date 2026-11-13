import { Flex, Stack, Text } from '@yuki-ui/react';

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '2.5rem',
  padding: 'var(--yuki-space-1) var(--yuki-space-2)',
  borderRadius: 'var(--yuki-radius-sm)',
  background: 'var(--yuki-color-bg-subtle)',
  border: '1px solid var(--yuki-color-border-subtle)',
  fontSize: 'var(--yuki-font-size-sm)',
  color: 'var(--yuki-color-text-secondary)',
};

export default function StackFlex() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          Stack（纵向、gap=2）
        </Text>
        <Stack gap="2">
          <div style={rowStyle}>第一行</div>
          <div style={rowStyle}>第二行</div>
          <div style={rowStyle}>第三行</div>
        </Stack>
      </div>

      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          Flex 纵向 + justify="between"（固定高度）
        </Text>
        <Flex direction="column" justify="between" gap="2" style={{ height: '8rem' }}>
          <div style={rowStyle}>顶部</div>
          <div style={rowStyle}>中间</div>
          <div style={rowStyle}>底部</div>
        </Flex>
      </div>

      <Flex justify="between" align="baseline" wrap gap="3">
        <Text weight="semibold">inline 与 baseline 对齐</Text>
        <Flex inline gap="1" align="baseline">
          <Text size="2xl" weight="semibold">
            42
          </Text>
          <Text size="sm" tone="tertiary">
            ms
          </Text>
        </Flex>
      </Flex>
    </div>
  );
}
