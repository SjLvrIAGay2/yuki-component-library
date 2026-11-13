import { Button, Icon, Popover, Text } from '@yuki-ui/react';

export default function CustomPopover() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-6)' }}>
      <Popover
        trigger="hover"
        placement="top"
        title="悬停触发"
        content={
          <Text size="sm" tone="secondary">
            指针移出后保留 120ms 关闭延迟，方便移动到浮层内部。
          </Text>
        }
      >
        <span style={{ fontSize: 'var(--yuki-font-size-sm)', borderBottom: '1px dashed var(--yuki-color-border-strong)' }}>
          悬停到我
        </span>
      </Popover>

      <Popover
        trigger="focus"
        placement="right"
        arrow={false}
        title="聚焦触发"
        classNames={{ popup: 'demo-popover-popup' }}
        content={
          <Text size="sm" tone="secondary">
            键盘 Tab 到按钮时打开；无箭头版本更贴近“浮层即面板”的视觉。
          </Text>
        }
      >
        <Button variant="soft" startIcon={<Icon name="info" />}>
          聚焦指南
        </Button>
      </Popover>

      <Popover
        placement="bottom-start"
        content={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-2)' }}>
            <Text size="sm" weight="medium">
              自定义偏移与宽度
            </Text>
            <Text size="xs" tone="tertiary">
              placement 为 bottom-start，浮层左缘与触发器对齐。
            </Text>
          </div>
        }
        styles={{ popup: { width: '18rem' } }}
      >
        <Button variant="outline">对齐左缘</Button>
      </Popover>
    </div>
  );
}
