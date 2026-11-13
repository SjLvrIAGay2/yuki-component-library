import { Button, Divider, Space } from '@yuki-ui/react';

export default function BasicSpace() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <Space size="2">
        <Button size="sm">取消</Button>
        <Button size="sm" variant="outline">
          保存草稿
        </Button>
        <Button size="sm">发布</Button>
      </Space>

      <Space size="3" split={<Divider orientation="vertical" />}>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>概览</span>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>成员</span>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>账单</span>
      </Space>

      <Space size="2" wrap>
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            style={{
              padding: 'var(--yuki-space-1) var(--yuki-space-2)',
              borderRadius: 'var(--yuki-radius-sm)',
              background: 'var(--yuki-color-bg-subtle)',
              fontSize: 'var(--yuki-font-size-xs)',
              color: 'var(--yuki-color-text-secondary)',
            }}
          >
            标签 {index + 1}
          </span>
        ))}
      </Space>
    </div>
  );
}
