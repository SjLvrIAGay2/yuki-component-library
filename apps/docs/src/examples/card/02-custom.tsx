import { Card, Icon, Tag } from '@yuki-ui/react';

const cover = (
  <div
    style={{
      height: 120,
      background:
        'linear-gradient(120deg, var(--yuki-color-primary-subtle), var(--yuki-color-bg-muted))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--yuki-color-primary)',
    }}
  >
    <Icon name="palette" size={36} />
  </div>
);

export default function CustomCard() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--yuki-space-5)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
      <Card hoverable variant="elevated" cover={cover} title="设计规范">
        <div style={{ display: 'grid', gap: 'var(--yuki-space-2)' }}>
          <span>2024 年第二版，覆盖 15 个数据展示组件。</span>
          <Tag size="sm" tone="success">已发布</Tag>
        </div>
      </Card>
      <Card variant="ghost" title="加载中" loading />
      <Card hoverable title="简洁卡片">
        只有正文与标题，适合信息密度较低的场景。
      </Card>
    </div>
  );
}
