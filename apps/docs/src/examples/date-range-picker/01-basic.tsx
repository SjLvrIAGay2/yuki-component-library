import { useState } from 'react';
import { DateRangePicker, Typography, type DateRange } from '@yuki-ui/react';

const defaultRange: DateRange = {
  start: new Date(2024, 2, 5),
  end: new Date(2024, 2, 10),
};

export default function BasicDateRangePicker() {
  const [value, setValue] = useState<DateRange | null>(defaultRange);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <DateRangePicker
        value={value}
        onChange={setValue}
        startPlaceholder="开始日期"
        endPlaceholder="结束日期"
        clearable
        onClear={() => setValue(null)}
      />
      <DateRangePicker defaultValue={defaultRange} startPlaceholder="开始日期" endPlaceholder="结束日期" />
      <DateRangePicker startPlaceholder="禁用状态" endPlaceholder="禁用状态" disabled />
      <Typography.Text tone="secondary">
        受控值：{value ? `${value.start?.toLocaleDateString()} ~ ${value.end?.toLocaleDateString()}` : '未选择'}
      </Typography.Text>
    </div>
  );
}
