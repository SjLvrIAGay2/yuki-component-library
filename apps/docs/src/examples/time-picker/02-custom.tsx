import { useState } from 'react';
import { TimePicker } from '@yuki-ui/react';

const formatValue = (value: string) => `每天 ${value}`;

export default function CustomTimePicker() {
  const [value, setValue] = useState<string | null>('10:00');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-sm)' }}>
      <TimePicker
        label="提醒时间"
        value={value}
        onChange={setValue}
        minuteStep={15}
        min="09:00"
        max="18:00"
        format={formatValue}
        placeholder="工作时间内，15 分钟步进"
        clearable
        onClear={() => setValue(null)}
      />
      <TimePicker defaultValue="12:00:00" showSeconds secondStep={10} placeholder="10 秒步进" />
      <TimePicker defaultValue="07:15" size="lg" borderless placeholder="大尺寸无边框" />
      <TimePicker defaultValue="11:11" invalid status="warning" placeholder="警告状态" />
    </div>
  );
}
