import { Icon, Text } from '@yuki-ui/react';

export default function CustomIcon() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--yuki-space-4)' }}>
        <Icon name="snowflake" size="1rem" />
        <Icon name="snowflake" size="1.5rem" />
        <Icon name="snowflake" size="2rem" style={{ color: 'var(--yuki-color-primary)' }} />
        <Icon name="snowflake" size="2.5rem" style={{ color: 'var(--yuki-color-text-tertiary)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--yuki-space-4)' }}>
        <Icon name="loader" spin size="1.25rem" style={{ color: 'var(--yuki-color-primary)' }} />
        <Icon name="heart" label="收藏" size="1.25rem" style={{ color: 'var(--yuki-color-danger)' }} />
        <Icon name="wifi" label="网络已连接" size="1.25rem" style={{ color: 'var(--yuki-color-success)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--yuki-space-3)' }}>
        <Icon label="四角星" size="1.5rem" style={{ color: 'var(--yuki-color-warning)' }}>
          <path d="M12 2 14.4 9.6 22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4Z" />
        </Icon>
        <Text size="sm" tone="secondary">
          使用 <code>children</code> 注入自定义 SVG 内容，仍继承图标盒模型与无障碍处理。
        </Text>
      </div>
    </div>
  );
}
