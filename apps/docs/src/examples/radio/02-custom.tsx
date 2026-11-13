import { useState } from 'react';
import { Radio, RadioGroup } from '@yuki-ui/react';

export default function CustomRadio() {
  const [value, setValue] = useState<string | number | boolean>('md');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)' }}>
      <RadioGroup
        value={value}
        onChange={(next) => setValue(next)}
        options={[
          { label: '小尺寸（sm）', value: 'sm' },
          { label: '中尺寸（md）', value: 'md' },
          { label: '大尺寸（lg）', value: 'lg' },
          { label: '不可用（禁用）', value: 'disabled', disabled: true },
        ]}
        direction="vertical"
        aria-label="组件尺寸"
      />
      <RadioGroup defaultValue="a" size="lg" disabled aria-label="禁用整组">
        <Radio value="a">整组禁用 A</Radio>
        <Radio value="b">整组禁用 B</Radio>
      </RadioGroup>
    </div>
  );
}
