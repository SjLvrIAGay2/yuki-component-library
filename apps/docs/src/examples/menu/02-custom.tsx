import { useState } from 'react';
import { Button, Icon, Menu, Text } from '@yuki-ui/react';

const horizontalItems = [
  { key: 'home', label: '首页', iconName: 'home' },
  { key: 'products', label: '产品', iconName: 'folder' },
  { key: 'pricing', label: '定价', iconName: 'tag' },
  { key: 'docs', label: '文档', iconName: 'file' },
] as const;

export default function CustomMenu() {
  const [mode, setMode] = useState<'horizontal' | 'inline'>('horizontal');
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['docs']);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Button
          size="sm"
          variant={mode === 'horizontal' ? 'solid' : 'outline'}
          onClick={() => setMode('horizontal')}
        >
          横向
        </Button>
        <Button
          size="sm"
          variant={mode === 'inline' ? 'solid' : 'outline'}
          onClick={() => setMode('inline')}
        >
          内联
        </Button>
        <Button
          size="sm"
          disabled={mode !== 'inline'}
          onClick={() => {
            setOpenKeys([]);
            setCollapsed((value) => !value);
          }}
        >
          {collapsed ? '展开' : '收起'}
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--yuki-space-6)', flexWrap: 'wrap' }}>
        <div
          style={{ inlineSize: mode === 'horizontal' ? '100%' : collapsed ? 'fit-content' : 220 }}
        >
          <Menu
            mode={mode}
            inlineCollapsed={collapsed}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onSelect={(key) => setSelectedKeys([key])}
            onOpenChange={(keys) => setOpenKeys(keys)}
            items={[
              ...horizontalItems.map(({ key, label, iconName }) => ({
                key,
                label,
                icon: mode === 'inline' ? <Icon name={iconName} /> : undefined,
              })),
              {
                key: 'guide',
                label: '指南',
                icon: mode === 'inline' ? <Icon name="bookmark" /> : undefined,
                children: [
                  { key: 'start', label: '快速开始' },
                  { key: 'theme', label: '主题定制' },
                  { key: 'danger', label: '删除项目', danger: true },
                ],
              },
              {
                key: 'disabled',
                label: '禁用项',
                disabled: true,
                icon: mode === 'inline' ? <Icon name="minus-circle" /> : undefined,
              },
            ]}
          />
        </div>
      </div>

      <Text size="sm" tone="tertiary">
        选中 {selectedKeys.join(', ') || '无'} · 展开 {openKeys.join(', ') || '无'}
      </Text>
    </div>
  );
}
