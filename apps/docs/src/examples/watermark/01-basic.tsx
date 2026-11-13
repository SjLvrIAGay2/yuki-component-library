import { Text, Watermark } from '@yuki-ui/react';

export default function BasicWatermark() {
  return (
    <Watermark content="Yuki UI 内部资料">
      <div
        style={{
          blockSize: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--yuki-space-4)',
          background: 'var(--yuki-color-bg-subtle)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
          borderRadius: 'var(--yuki-radius-lg)',
        }}
      >
        <Text tone="secondary">所有内容都会覆盖重复水印，水印不参与交互。</Text>
      </div>
    </Watermark>
  );
}
