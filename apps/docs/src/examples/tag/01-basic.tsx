import { Tag } from '@yuki-ui/react';

export default function BasicTag() {
  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-2)' }}
    >
      <Tag>默认</Tag>
      <Tag tone="primary">主要</Tag>
      <Tag tone="success">已完成</Tag>
      <Tag tone="warning">待处理</Tag>
      <Tag tone="danger">已拒绝</Tag>
      <Tag tone="info">信息</Tag>
      <Tag variant="solid" tone="primary">
        实心
      </Tag>
      <Tag variant="outline" tone="success">
        描边
      </Tag>
    </div>
  );
}
