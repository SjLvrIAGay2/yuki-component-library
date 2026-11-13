import { useState } from 'react';
import { Menu, Text } from '@yuki-ui/react';

export default function BasicMenu() {
  const [selected, setSelected] = useState<string[]>(['home']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <div style={{ inlineSize: 240 }}>
        <Menu
          defaultSelectedKeys={['home']}
          defaultOpenKeys={['docs']}
          onSelect={(key) => setSelected([key])}
          items={[
            { key: 'home', label: '工作台' },
            { key: 'projects', label: '项目' },
            {
              key: 'docs',
              label: '文档',
              children: [
                { key: 'guide', label: '使用指南' },
                { key: 'api', label: 'API 参考' },
                { key: 'changelog', label: '更新日志' },
              ],
            },
            { type: 'divider', key: 'divider-1' },
            { key: 'settings', label: '设置' },
          ]}
        />
      </div>
      <Text size="sm" tone="tertiary">
        当前选中：{selected[0]}
      </Text>
    </div>
  );
}
