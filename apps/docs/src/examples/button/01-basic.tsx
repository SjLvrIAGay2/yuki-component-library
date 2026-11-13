import { Button, Icon } from '@yuki-ui/react';

export default function BasicButton() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--yuki-space-3)',
      }}
    >
      <Button startIcon={<Icon name="sparkles" />}>生成摘要</Button>
      <Button variant="soft" tone="neutral">
        次要操作
      </Button>
      <Button variant="outline" tone="neutral">
        描边按钮
      </Button>
      <Button variant="ghost" tone="neutral">
        幽灵按钮
      </Button>
      <Button variant="link">文字链接</Button>
      <Button tone="danger" startIcon={<Icon name="trash" />}>
        删除
      </Button>
      <Button loading loadingText="保存中">
        保存
      </Button>
      <Button disabled>不可用</Button>
    </div>
  );
}
