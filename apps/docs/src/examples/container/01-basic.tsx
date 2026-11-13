import { Container, Text } from '@yuki-ui/react';

export default function BasicContainer() {
  return (
    <div
      style={{
        background: 'var(--yuki-color-bg-subtle)',
        border: '1px dashed var(--yuki-color-border)',
        borderRadius: 'var(--yuki-radius-md)',
        paddingBlock: 'var(--yuki-space-4)',
      }}
    >
      <Container size="md" gutter="4">
        <div
          style={{
            padding: 'var(--yuki-space-4)',
            borderRadius: 'var(--yuki-radius-sm)',
            background: 'var(--yuki-color-bg-surface)',
            border: '1px solid var(--yuki-color-border-subtle)',
          }}
        >
          <Text weight="semibold" gutterBottom>
            页面正文宽度
          </Text>
          <Text tone="secondary" size="sm">
            Container 在宽屏下把内容限制在可读宽度，在窄屏下保留安全边距。
            把浏览器拉宽，可以看到内容不再无限延伸。
          </Text>
        </div>
      </Container>
    </div>
  );
}
