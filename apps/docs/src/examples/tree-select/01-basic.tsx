import { useState } from 'react';
import { TreeSelect, type TreeNodeOption } from '@yuki-ui/react';

const options: TreeNodeOption<string>[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州' },
      { value: 'ningbo', label: '宁波' },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
      { value: 'suzhou', label: '苏州' },
    ],
  },
];

export default function BasicTreeSelect() {
  const [value, setValue] = useState<string | null>('hangzhou');
  const [cities, setCities] = useState<string[]>(['hangzhou', 'nanjing']);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <TreeSelect
        options={options}
        value={value}
        onChange={setValue}
        placeholder="选择城市"
        clearable
      />
      <TreeSelect options={options} multiple value={cities} onChange={setCities} placeholder="多选" />
      <TreeSelect options={options} placeholder="禁用状态" disabled />
    </div>
  );
}
