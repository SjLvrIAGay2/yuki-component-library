import { useState } from 'react';
import { Button, Dropdown, Icon, Space, Text } from '@yuki-ui/react';

export default function CustomDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Space size="4" wrap>
        <Dropdown
          triggerMode="hover"
          placement="top-end"
          arrow
          open={open}
          onOpenChange={setOpen}
          items={[
            { type: 'group', key: 'nav', label: '导航', children: [
              { key: 'home', label: '回到首页', icon: <Icon name="home" size={16} /> },
              { key: 'star', label: '收藏', icon: <Icon name="star" size={16} /> },
            ] },
            { type: 'divider', key: 'divider-1' },
            { key: 'share', label: '分享', icon: <Icon name="share" size={16} /> },
            { key: 'disabled', label: '暂无权限', disabled: true },
            { key: 'remove', label: '移出项目', danger: true },
          ]}
          trigger={<Button variant="soft">悬停 / 受控展开</Button>}
        />

        <Dropdown
          placement="bottom-end"
          closeOnSelect={false}
          items={[
            { key: 'compact', label: '紧凑视图' },
            { key: 'comfortable', label: '舒适视图' },
          ]}
          trigger={<Button variant="ghost" startIcon={<Icon name="list" size={16} />}>
            多选不关闭
          </Button>}
        />
      </Space>
      <Text size="sm" tone="tertiary">
        受控展开状态：{open ? '已展开' : '已收起'}
      </Text>
    </div>
  );
}
