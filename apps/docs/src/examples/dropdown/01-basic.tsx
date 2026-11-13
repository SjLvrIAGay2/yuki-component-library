import { useState } from 'react';
import { Button, Dropdown, Icon, Text } from '@yuki-ui/react';

export default function BasicDropdown() {
  const [last, setLast] = useState('—');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--yuki-space-4)' }}>
      <Dropdown
        onSelect={(key) => setLast(String(key))}
        items={[
          { key: 'edit', label: '编辑', icon: <Icon name="edit" size={16} /> },
          { key: 'copy', label: '复制', icon: <Icon name="copy" size={16} />, extra: '⌘C' },
          { key: 'delete', label: '删除', icon: <Icon name="trash" size={16} />, danger: true },
        ]}
        trigger={<Button variant="outline" startIcon={<Icon name="settings" size={16} />}>
          更多操作
        </Button>}
      />
      <Text size="sm" tone="tertiary">
        最近选择：{last}
      </Text>
    </div>
  );
}
