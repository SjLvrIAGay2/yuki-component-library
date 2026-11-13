import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@yuki-ui/react';

const options = [
  { label: '组件库', value: 'components' },
  { label: '设计令牌', value: 'tokens' },
  { label: '文档站', value: 'docs' },
  { label: '无障碍', value: 'a11y', disabled: true },
];

export default function CustomCheckbox() {
  const [all, setAll] = useState(false);
  const [values, setValues] = useState<Array<string | number | boolean>>(['components']);

  const toggleAll = (checked: boolean) => {
    setAll(checked);
    setValues(checked ? options.filter((item) => !item.disabled).map((item) => item.value) : []);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)' }}>
      <Checkbox
        checked={all}
        indeterminate={values.length > 0 && values.length < options.length - 1}
        onChange={toggleAll}
        label="全选"
        description="选择所有可编辑的模块"
      />
      <CheckboxGroup
        value={values}
        options={options}
        direction="vertical"
        onChange={(next) => {
          setValues(next);
          setAll(next.length === options.length - 1);
        }}
      />
    </div>
  );
}
