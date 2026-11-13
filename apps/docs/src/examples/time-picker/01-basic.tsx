import { useState } from 'react';
import { TimePicker } from '@yuki-ui/react';

export default function BasicTimePicker() {
  const [value, setValue] = useState<string | null>('09:30');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-xs)' }}>
      <TimePicker
        value={value}
        onChange={setValue}
        placeholder="选择时间"
        clearable
        onClear={() => setValue(null)}
      />
      <TimePicker defaultValue="18:45" showSeconds placeholder="含秒的时间" />
      <TimePicker placeholder="禁用状态" disabled />
      <TimePicker placeholder="只读状态" readOnly defaultValue="08:00" />
    </div>
  );
}
