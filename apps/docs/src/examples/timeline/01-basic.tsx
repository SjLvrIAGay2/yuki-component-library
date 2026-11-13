import { Timeline } from '@yuki-ui/react';

const items = [
  { key: '1', children: '提交需求评审', label: '09:20' },
  { key: '2', children: '完成交互稿', label: '11:05', color: 'primary' as const },
  { key: '3', children: '开发自测通过', label: '16:40', color: 'success' as const },
];

export default function BasicTimeline() {
  return <Timeline items={items} />;
}
