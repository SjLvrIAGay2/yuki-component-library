import { useState } from 'react';
import { Select } from '@yuki-ui/react';

const options = [
  { value: 'frontend', label: '前端工程师' },
  { value: 'backend', label: '后端工程师' },
  { value: 'designer', label: '产品设计师' },
  { value: 'qa', label: '测试工程师', disabled: true },
];

export default function BasicSelect() {
  const [value, setValue] = useState<string | null>('frontend');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-sm)' }}>
      <Select
        options={options}
        value={value}
        onChange={(next, option) => setValue(option ? option.value : null)}
        placeholder="请选择岗位"
        clearable
      />
      <Select options={options} defaultValue="backend" placeholder="非受控，默认选中后端" />
      <Select options={options} placeholder="禁用状态" disabled />
      <Select options={options} placeholder="只读状态" readOnly defaultValue="designer" />
    </div>
  );
}
