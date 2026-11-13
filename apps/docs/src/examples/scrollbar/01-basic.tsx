import { Scrollbar, Text } from '@yuki-ui/react';

export default function BasicScrollbar() {
  return (
    <div
      style={{
        blockSize: 200,
        border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
        borderRadius: 'var(--yuki-radius-md)',
      }}
    >
      <Scrollbar style={{ blockSize: '100%' }}>
        <div style={{ padding: 'var(--yuki-space-4)' }}>
          {Array.from({ length: 12 }, (_, index) => (
            <Text key={index} as="p" size="sm" tone="secondary" style={{ marginBlock: 'var(--yuki-space-3)' }}>
              自定义滚动条会在右侧显示，原生滚动条已隐藏。段落 {index + 1}。
            </Text>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
}
