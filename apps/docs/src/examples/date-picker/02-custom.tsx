import { useState } from 'react';
import { DatePicker } from '@yuki-ui/react';

const min = new Date(2024, 0, 1);
const max = new Date(2024, 11, 31);

const formatDate = (date: Date) =>
  `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;

export default function CustomDatePicker() {
  const [value, setValue] = useState<Date | null>(new Date(2024, 2, 18));

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <DatePicker
        label="预约日期"
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
        weekStartsOn={1}
        format={formatDate}
        placeholder="仅工作日，周一为一周起点"
        clearable
        onClear={() => setValue(null)}
      />
      <DatePicker
        defaultValue={new Date(2024, 5, 10)}
        format={formatDate}
        size="lg"
        borderless
        placeholder="大尺寸无边框"
      />
      <DatePicker
        defaultValue={new Date(2024, 7, 8)}
        invalid
        status="error"
        placeholder="错误状态"
      />
    </div>
  );
}
