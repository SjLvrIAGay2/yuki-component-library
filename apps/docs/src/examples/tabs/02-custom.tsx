import { Icon, Tabs } from '@yuki-ui/react';

const items = [
  {
    key: 'design',
    label: '设计',
    icon: <Icon name="palette" />,
    children: '颜色、间距与组件视觉规范。',
  },
  {
    key: 'code',
    label: '开发',
    icon: <Icon name="code" />,
    children: '组件 API、测试与类型约束。',
  },
  {
    key: 'docs',
    label: '文档',
    icon: <Icon name="file" />,
    children: '使用说明、示例与无障碍指引。',
  },
];

const itemsWithDisabledDocs = items.map((item) => ({ ...item, disabled: item.key === 'docs' }));

export default function CustomTabs() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Tabs items={itemsWithDisabledDocs} variant="segmented" defaultValue="design" />
      <Tabs items={itemsWithDisabledDocs} variant="card" centered />
      <Tabs items={items} tabPosition="left" size="sm" />
    </div>
  );
}
