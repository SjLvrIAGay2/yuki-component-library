import { Button, Empty, Icon } from '@yuki-ui/react';

export default function CustomEmpty() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Empty
        icon={<Icon name="inbox" size={56} label="空收件箱" />}
        description="收件箱里还没有任何消息"
        size="lg"
      >
        <Button size="sm" variant="soft" startIcon={<Icon name="refresh" />}>
          刷新列表
        </Button>
      </Empty>
      <Empty image={null} description="自定义图片插槽已关闭" size="sm" />
    </div>
  );
}
