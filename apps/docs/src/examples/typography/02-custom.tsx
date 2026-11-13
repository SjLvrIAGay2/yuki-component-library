import { Paragraph, Text, Title } from '@yuki-ui/react';

export default function CustomTypography() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <div style={{ maxWidth: '22rem' }}>
        <Text truncate>
          单行截断：这是一段刻意写得很长的文字，用来展示溢出时的省略号处理，而不是让容器被撑开。
        </Text>
        <div style={{ height: 'var(--yuki-space-2)' }} />
        <Text truncate={2} tone="secondary">
          多行截断（两行）：这段文字会在第二行结束时收起并显示省略号。排版组件的截断能力由
          CSS 变量驱动，因此可以在运行时调整行数而不需要额外的类名。
        </Text>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--yuki-space-3)' }}>
        <Text strong>加粗</Text>
        <Text italic>斜体</Text>
        <Text underline>下划线</Text>
        <Text strike>删除线</Text>
        <Text code>const token = 12</Text>
        <Text mark>高亮标记</Text>
        <Text tone="danger" weight="medium">
          危险语义
        </Text>
      </div>

      <Title level={4} as="div" size="2xl" align="center" gutterBottom>
        视觉标题 · 语义 div · 居中对齐
      </Title>
      <Paragraph as="div" tone="tertiary" align="justify">
        通过 <code>as</code> 可以把视觉样式与 DOM 语义解耦：当区块标题不应进入文档大纲时，
        用 div 渲染视觉标题，而真正的层级仍由页面结构决定。
      </Paragraph>
    </div>
  );
}
