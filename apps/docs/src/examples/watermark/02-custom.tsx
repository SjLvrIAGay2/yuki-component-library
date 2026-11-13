import { Text, Watermark } from '@yuki-ui/react';

export default function CustomWatermark() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Watermark
        content={['内部资料', '禁止外传']}
        rotate={-30}
        gap={[60, 80]}
        offset={[16, 8]}
        opacity={0.18}
        fontSize={16}
        color="rgba(217, 45, 32, 0.9)"
      >
        <div
          style={{
            blockSize: 160,
            padding: 'var(--yuki-space-4)',
            background: 'var(--yuki-color-bg-surface)',
            border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border-subtle)',
            borderRadius: 'var(--yuki-radius-lg)',
          }}
        >
          <Text>多行文字、角度、间距、颜色与透明度均可配置。</Text>
        </div>
      </Watermark>

      <Watermark content="仅本页" width={90} height={40} fontSize={12} zIndex={20} opacity={0.1}>
        <div
          style={{
            blockSize: 100,
            padding: 'var(--yuki-space-4)',
            background: 'var(--yuki-color-bg-muted)',
            borderRadius: 'var(--yuki-radius-md)',
          }}
        >
          <Text size="sm" tone="secondary">
            通过 width / height 调整纹理密度。
          </Text>
        </div>
      </Watermark>
    </div>
  );
}
