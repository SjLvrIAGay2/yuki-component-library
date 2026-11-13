import { useState } from 'react';
import { Calendar, Icon } from '@yuki-ui/react';

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

export default function CustomCalendar() {
  const [selected, setSelected] = useState<Date | null>(null);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 360 }}>
      <Calendar
        value={selected}
        onSelect={setSelected}
        weekStart={1}
        disabledDate={isWeekend}
        cellRender={(date, info) =>
          info.inCurrentMonth && date.getDate() % 5 === 0 ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {date.getDate()}
              <Icon
                name="dot"
                size={6}
                style={{ color: 'var(--yuki-color-primary)' }}
              />
            </span>
          ) : undefined
        }
        headerRender={({ title, prev, next }) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--yuki-space-2)',
            }}
          >
            <button type="button" onClick={prev} aria-label="上一月">
              <Icon name="chevron-left" />
            </button>
            <strong style={{ flex: 1, textAlign: 'center' }}>{title}</strong>
            <button type="button" onClick={next} aria-label="下一月">
              <Icon name="chevron-right" />
            </button>
          </div>
        )}
      />
      <span style={{ color: 'var(--yuki-color-text-secondary)' }}>
        已选择：{selected ? selected.toLocaleDateString('zh-CN') : '未选择（周末不可选）'}
      </span>
    </div>
  );
}
