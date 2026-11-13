import { Paragraph, Text, Title } from '@yuki-ui/react';

export default function BasicTypography() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Title level={1}>静谧的界面语言</Title>
      <Title level={2}>区块标题</Title>
      <Title level={3}>小节标题</Title>
      <Title level={4}>更小的标题</Title>
      <Title level={5}>最小标题</Title>

      <Paragraph>
        正文默认使用舒展的行高，适合连续阅读。字号、行高与颜色都来自全局 token，
        因此明暗主题切换时不需要任何组件改动。
      </Paragraph>
      <Text tone="secondary">次级说明文字，用于补充标题之上的上下文。</Text>
      <Text tone="tertiary" size="sm">
        三级文字，用于时间戳、来源与低频元信息。
      </Text>
    </div>
  );
}
