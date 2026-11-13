import { Empty } from '@yuki-ui/react';

export default function BasicEmpty() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Empty />
      <Empty description="暂无搜索结果，换个关键词试试" size="sm" />
    </div>
  );
}
