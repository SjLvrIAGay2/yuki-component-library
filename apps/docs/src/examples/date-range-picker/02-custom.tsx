import { useState } from 'react';
import { DateRangePicker, type DateRange } from '@yuki-ui/react';

const today = new Date();

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const presets = [
  {
    label: '最近 7 天',
    value: { start: startOfDay(new Date(today.getTime() - 6 * 86400000)), end: startOfDay(today) },
  },
  {
    label: '本月',
    value: {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: startOfDay(today),
    },
  },
  {
    label: '本季度',
    value: {
      start: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1),
      end: startOfDay(today),
    },
  },
];

const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

export default function CustomDateRangePicker() {
  const [value, setValue] = useState<DateRange | null>(null);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-lg)' }}>
      <DateRangePicker
        value={value}
        onChange={setValue}
        presets={presets}
        separator="至"
        format={formatDate}
        weekStartsOn={1}
        clearable
        onClear={() => setValue(null)}
        startPlaceholder="开始"
        endPlaceholder="结束"
      />
      <DateRangePicker
        defaultValue={{ start: new Date(2024, 2, 5), end: new Date(2024, 2, 10) }}
        min={new Date(2024, 0, 1)}
        max={new Date(2024, 5, 30)}
        disabledDate={(date) => date.getDay() === 0}
        format={formatDate}
        size="lg"
        borderless
      />
    </div>
  );
}
