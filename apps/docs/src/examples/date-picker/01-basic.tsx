import { useState } from 'react';
import { DatePicker } from '@yuki-ui/react';

export default function BasicDatePicker() {
  const [value, setValue] = useState<Date | null>(new Date(2024, 2, 15));

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-sm)' }}>
      <DatePicker
        value={value}
        onChange={setValue}
        placeholder="选择日期"
        clearable
        onClear={() => setValue(null)}
      />
      <DatePicker defaultValue={new Date(2024, 2, 1)} placeholder="非受控，默认 3 月 1 日" />
      <DatePicker placeholder="禁用状态" disabled />
      <DatePicker placeholder="只读状态" readOnly defaultValue={new Date(2024, 2, 20)} />
    </div>
  );
}
