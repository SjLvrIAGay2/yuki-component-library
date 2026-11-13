import { Button, Icon, Popover, Space, Text } from '@yuki-ui/react';

export default function BasicPopover() {
  return (
    <Space size="4" wrap>
      <Popover
        content={
          <div style={{ maxWidth: '16rem' }}>
            <Text size="sm" tone="secondary">
              这里是浮层内容。它可以包含多段文字、链接或按钮，而不打断当前页面。
            </Text>
          </div>
        }
      >
        <Button variant="outline">点击查看说明</Button>
      </Popover>

      <Popover
        title="快捷操作"
        content={
          <Space direction="vertical" size="2" align="start">
            <Button size="sm" variant="ghost">
              复制链接
            </Button>
            <Button size="sm" variant="ghost">
              导出为 Markdown
            </Button>
            <Button size="sm" variant="ghost" tone="danger">
              删除草稿
            </Button>
          </Space>
        }
      >
        <Button variant="ghost" iconOnly aria-label="更多操作">
          <Icon name="more-horizontal" />
        </Button>
      </Popover>
    </Space>
  );
}
