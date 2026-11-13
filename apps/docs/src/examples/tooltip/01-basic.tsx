import { Button, Icon, Space, Tooltip } from '@yuki-ui/react';

export default function BasicTooltip() {
  return (
    <Space size="3" wrap>
      <Tooltip content="新建文件">
        <Button variant="outline" iconOnly aria-label="新建文件">
          <Icon name="plus" />
        </Button>
      </Tooltip>
      <Tooltip content="刷新数据">
        <Button variant="ghost" iconOnly aria-label="刷新数据">
          <Icon name="refresh" />
        </Button>
      </Tooltip>
      <Tooltip content="设置（⌘ ,）">
        <Button variant="ghost" iconOnly aria-label="设置">
          <Icon name="settings" />
        </Button>
      </Tooltip>
      <Tooltip content="这段被截断的文字的完整内容会在这里显示出来">
        <span style={{ fontSize: 'var(--yuki-font-size-sm)', borderBottom: '1px dashed var(--yuki-color-border-strong)' }}>
          悬停查看完整文字
        </span>
      </Tooltip>
    </Space>
  );
}
