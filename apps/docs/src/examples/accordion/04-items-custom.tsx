import { Accordion, Tag } from '@yuki-ui/react';

const items = [
  {
    value: 'design',
    title: '设计规范',
    extra: <Tag size="sm" tone="primary">3 项</Tag>,
    content: '颜色、间距、圆角与动效均来自统一 Token，禁止硬编码视觉值。',
  },
  {
    value: 'a11y',
    title: '无障碍检查',
    extra: <Tag size="sm" tone="warning">待办</Tag>,
    content: '键盘可达、焦点可见、颜色对比度满足 WCAG AA。',
  },
  {
    value: 'disabled',
    title: '暂不可用',
    disabled: true,
    content: '禁用项不会响应点击与键盘操作。',
  },
];

export default function CustomAccordion() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Accordion items={items} type="single" collapsible expandIconPosition="end" />
      <Accordion items={items.slice(0, 2)} ghost size="sm" />
    </div>
  );
}
