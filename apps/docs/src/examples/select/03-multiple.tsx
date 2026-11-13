import { useState } from 'react';
import { Select } from '@yuki-ui/react';

const options = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular' },
];

export default function BasicMultiSelect() {
  const [value, setValue] = useState<string[]>(['vue', 'react']);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-sm)' }}>
      <Select
        multiple
        options={options}
        value={value}
        onChange={setValue}
        placeholder="选择多个框架"
        clearable
      />
      <Select
        multiple
        options={options}
        defaultValue={['vue', 'react', 'svelte', 'solid']}
        maxTagCount={2}
        placeholder="折叠多余标签"
      />
      <Select
        multiple
        options={options}
        defaultValue={['react']}
        removable={false}
        placeholder="标签不可单独移除"
      />
    </div>
  );
}
