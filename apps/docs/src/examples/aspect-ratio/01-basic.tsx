import { AspectRatio, Text } from '@yuki-ui/react';

export default function BasicAspectRatio() {
  return (
    <div style={{ maxWidth: '28rem' }}>
      <AspectRatio
        ratio={16 / 9}
        style={{
          borderRadius: 'var(--yuki-radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--yuki-color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(135deg, var(--yuki-color-primary-subtle), var(--yuki-color-bg-muted))',
            color: 'var(--yuki-color-text-secondary)',
            fontSize: 'var(--yuki-font-size-sm)',
          }}
        >
          16 : 9 媒体占位
        </div>
      </AspectRatio>
      <Text size="xs" tone="tertiary" style={{ display: 'block', marginTop: 'var(--yuki-space-2)' }}>
        高度由宽度推导，媒体加载前后不会发生布局跳动。
      </Text>
    </div>
  );
}
