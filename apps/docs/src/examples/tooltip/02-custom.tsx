import { Button, Icon, Tooltip } from '@yuki-ui/react';

export default function CustomTooltip() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--yuki-space-4)' }}>
      <Tooltip content="上方（默认）" placement="top">
        <Button size="sm" variant="soft">
          Top
        </Button>
      </Tooltip>
      <Tooltip content="下方" placement="bottom">
        <Button size="sm" variant="soft">
          Bottom
        </Button>
      </Tooltip>
      <Tooltip content="左侧" placement="left">
        <Button size="sm" variant="soft">
          Left
        </Button>
      </Tooltip>
      <Tooltip content="右侧" placement="right">
        <Button size="sm" variant="soft">
          Right
        </Button>
      </Tooltip>

      <Tooltip content="无延迟打开" openDelay={0} closeDelay={0}>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)' }}>即时提示</span>
      </Tooltip>

      <Tooltip content="不会出现" disabled>
        <span style={{ fontSize: 'var(--yuki-font-size-sm)', color: 'var(--yuki-color-text-tertiary)' }}>
          已禁用
        </span>
      </Tooltip>

      <Tooltip
        content="自定义气泡宽度与无箭头外观"
        arrow={false}
        styles={{ popup: { maxWidth: '20rem' } }}
      >
        <Button size="sm" variant="outline" startIcon={<Icon name="info" />}>
          无箭头
        </Button>
      </Tooltip>
    </div>
  );
}
