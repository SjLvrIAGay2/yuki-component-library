import { useState } from 'react';
import { Cascader, type CascaderOption } from '@yuki-ui/react';

const options: CascaderOption<string>[] = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州' },
      { value: 'ningbo', label: '宁波' },
      { value: 'wenzhou', label: '温州' },
    ],
  },
  {
    value: 'js',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
      { value: 'suzhou', label: '苏州' },
    ],
  },
  {
    value: 'sh',
    label: '上海',
    children: [{ value: 'pudong', label: '浦东新区' }],
  },
];

export default function BasicCascader() {
  const [value, setValue] = useState<readonly string[] | null>(['zj', 'hangzhou']);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <Cascader
        options={options}
        value={value}
        onChange={setValue}
        placeholder="选择省市"
        clearable
        onClear={() => setValue(null)}
      />
      <Cascader options={options} defaultValue={['js', 'suzhou']} placeholder="非受控" />
      <Cascader options={options} placeholder="禁用状态" disabled />
    </div>
  );
}
