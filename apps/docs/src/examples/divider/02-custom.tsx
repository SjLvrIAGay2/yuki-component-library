import { Divider, Space, Text } from '@yuki-ui/react';

export default function CustomDivider() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          labelPosition 与 variant
        </Text>
        <Divider labelPosition="start">起始标签</Divider>
        <Divider variant="dashed">虚线</Divider>
        <Divider variant="dotted" labelPosition="end">
          末尾标签
        </Divider>
        <Divider strong>强边框</Divider>
      </div>

      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          垂直分隔与 Space.split
        </Text>
        <Space split={<Divider orientation="vertical" />} size="3">
          <Text size="sm">概览</Text>
          <Text size="sm">活动</Text>
          <Text size="sm">设置</Text>
        </Space>
      </div>
    </div>
  );
}
