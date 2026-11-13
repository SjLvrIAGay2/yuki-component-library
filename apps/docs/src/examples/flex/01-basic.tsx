import { Flex, Text } from '@yuki-ui/react';

const chipStyle: React.CSSProperties = {
  padding: 'var(--yuki-space-1) var(--yuki-space-3)',
  borderRadius: 'var(--yuki-radius-full)',
  background: 'var(--yuki-color-bg-subtle)',
  border: '1px solid var(--yuki-color-border)',
  fontSize: 'var(--yuki-font-size-sm)',
};

export default function BasicFlex() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          justify="between" + align="center"
        </Text>
        <Flex justify="between" align="center" gap="3">
          <Text weight="medium">本月使用量</Text>
          <span style={{ color: 'var(--yuki-color-text-secondary)', fontSize: 'var(--yuki-font-size-sm)' }}>
            12,480 / 20,000
          </span>
        </Flex>
      </div>

      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          wrap + gap
        </Text>
        <Flex wrap gap="2">
          {['设计', '工程', '文档', '无障碍', '主题', '国际化', '动效', '测试'].map((item) => (
            <span key={item} style={chipStyle}>
              {item}
            </span>
          ))}
        </Flex>
      </div>

      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          justify="center" + gap
        </Text>
        <Flex justify="center" gap="4">
          <span style={chipStyle}>左</span>
          <span style={chipStyle}>中</span>
          <span style={chipStyle}>右</span>
        </Flex>
      </div>
    </div>
  );
}
