import { Icon, Tag, Timeline } from '@yuki-ui/react';

const items = [
  {
    key: '1',
    color: 'success',
    dot: <Icon name="check" size={14} />,
    children: (
      <div style={{ display: 'grid', gap: 'var(--yuki-space-1)' }}>
        <strong>发布 v0.4.0</strong>
        <Tag size="sm" tone="success">成功</Tag>
      </div>
    ),
    label: '10:00',
  },
  {
    key: '2',
    color: 'warning',
    children: '灰度期间发现 2 个样式回归',
    label: '10:35',
  },
  {
    key: '3',
    color: 'danger',
    children: '回滚并定位问题',
    label: '11:10',
  },
];

export default function CustomTimeline() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-8)' }}>
      <Timeline items={items} pending="等待复盘中" />
      <Timeline items={items} mode="alternate" reverse />
    </div>
  );
}
