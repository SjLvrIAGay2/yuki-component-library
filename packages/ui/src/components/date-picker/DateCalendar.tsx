import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import {
  addDays,
  addMonths,
  endOfMonth,
  formatDayLabel,
  formatMonthLabel,
  getCalendarWeeks,
  getWeekdayLabels,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  toDateKey,
  type DateRange,
} from './date-utils';

export type DateCalendarMode = 'single' | 'range';

export interface DateCalendarDayState {
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  today: boolean;
  outside: boolean;
  disabled: boolean;
  active: boolean;
}

export interface DateCalendarClassNames {
  root?: string;
  header?: string;
  nav?: string;
  title?: string;
  weekdays?: string;
  weekday?: string;
  grid?: string;
  row?: string;
  cell?: string;
  day?: string;
  footer?: string;
}

export interface DateCalendarStyles {
  root?: CSSProperties;
  grid?: CSSProperties;
  day?: CSSProperties;
}

export interface DateCalendarProps {
  /** Month currently displayed by the grid. */
  month: Date;
  onMonthChange: (month: Date) => void;
  /** Roving focus date for keyboard navigation. */
  activeDate: Date;
  onActiveDateChange: (date: Date) => void;
  mode?: DateCalendarMode;
  selected?: Date | null;
  range?: DateRange;
  /** Preview end while the user hovers a day in range mode. */
  rangeHover?: Date | null;
  /** Notifies the owner when the pointer enters/leaves a day (range preview). */
  onDayHover?: (date: Date | null) => void;
  onSelect: (date: Date) => void;
  min?: Date | null;
  max?: Date | null;
  disabledDate?: (date: Date) => boolean;
  weekStartsOn?: number;
  locale: string;
  labels: { prevMonth: string; nextMonth: string };
  footer?: ReactNode;
  /** Focus the active day when the calendar appears. */
  autoFocus?: boolean;
  classNames?: DateCalendarClassNames;
  styles?: DateCalendarStyles;
  renderDay?: (date: Date, state: DateCalendarDayState) => ReactNode;
}

function resolveRange(range: DateRange | undefined, hover: Date | null | undefined): DateRange {
  if (!range?.start) return { start: null, end: null };
  if (range.end) return range;
  return { start: range.start, end: hover ?? range.start };
}

export const DateCalendar = forwardRef<HTMLDivElement, DateCalendarProps>(
  function DateCalendar(
    {
      month,
      onMonthChange,
      activeDate,
      onActiveDateChange,
      mode = 'single',
      selected = null,
      range,
      rangeHover,
      onDayHover,
      onSelect,
      min,
      max,
      disabledDate,
      weekStartsOn = 0,
      locale,
      labels,
      footer,
      autoFocus = false,
      classNames,
      styles,
      renderDay,
    },
    forwardedRef,
  ) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [focusWithin, setFocusWithin] = useState(false);

    const weeks = useMemo(() => getCalendarWeeks(month, weekStartsOn), [month, weekStartsOn]);
    const weekdayLabels = useMemo(
      () => getWeekdayLabels(weekStartsOn, locale),
      [weekStartsOn, locale],
    );
    const disabled = (date: Date) => isDateDisabled(date, { min, max, disabledDate });
    const today = startOfDay(new Date());
    const resolvedRange = resolveRange(range, rangeHover);

    const moveActive = (date: Date) => {
      onActiveDateChange(startOfDay(date));
      if (!isSameMonth(date, month)) onMonthChange(startOfMonth(date));
    };

    const onDayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const dateKey = target?.closest<HTMLElement>('[data-date]')?.dataset.date;
      const anchor = dateKey ? new Date(`${dateKey}T00:00:00`) : activeDate;
      const current = Number.isNaN(anchor.getTime()) ? activeDate : anchor;

      let next: Date | null = null;
      switch (event.key) {
        case 'ArrowLeft':
          next = addDays(current, -1);
          break;
        case 'ArrowRight':
          next = addDays(current, 1);
          break;
        case 'ArrowUp':
          next = addDays(current, -7);
          break;
        case 'ArrowDown':
          next = addDays(current, 7);
          break;
        case 'Home':
          next = addDays(current, -((current.getDay() - weekStartsOn + 7) % 7));
          break;
        case 'End':
          next = addDays(current, 6 - ((current.getDay() - weekStartsOn + 7) % 7));
          break;
        case 'PageUp':
          next = addMonths(current, event.shiftKey ? -12 : -1);
          break;
        case 'PageDown':
          next = addMonths(current, event.shiftKey ? 12 : 1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (!disabled(current)) onSelect(current);
          return;
        default:
          return;
      }
      event.preventDefault();
      moveActive(next);
    };

    // Keep real focus on the active day so screen readers announce it.
    useEffect(() => {
      if (!autoFocus && !focusWithin) return;
      const node = gridRef.current?.querySelector<HTMLButtonElement>(
        `[data-date="${toDateKey(activeDate)}"]`,
      );
      node?.focus({ preventScroll: true });
    }, [activeDate, autoFocus, focusWithin]);

    const monthLabel = formatMonthLabel(month, locale);

    return (
      <div
        ref={forwardedRef}
        data-slot="date-calendar"
        className={cx('yuki-date-calendar', classNames?.root)}
        style={styles?.root}
      >
        <div
          data-slot="header"
          className={cx('yuki-date-calendar__header', classNames?.header)}
        >
          <button
            type="button"
            data-slot="prev-month"
            aria-label={labels.prevMonth}
            className={cx('yuki-date-calendar__nav', classNames?.nav)}
            onClick={() => onMonthChange(addMonths(month, -1))}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div
            data-slot="title"
            aria-live="polite"
            className={cx('yuki-date-calendar__title', classNames?.title)}
          >
            {monthLabel}
          </div>
          <button
            type="button"
            data-slot="next-month"
            aria-label={labels.nextMonth}
            className={cx('yuki-date-calendar__nav', classNames?.nav)}
            onClick={() => onMonthChange(addMonths(month, 1))}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <div
          ref={gridRef}
          role="grid"
          aria-label={monthLabel}
          data-slot="grid"
          className={cx('yuki-date-calendar__grid', classNames?.grid)}
          style={styles?.grid}
          onKeyDown={onDayKeyDown}
          onMouseLeave={() => onDayHover?.(null)}
          onFocus={() => setFocusWithin(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setFocusWithin(false);
            }
          }}
        >
          <div role="row" className="yuki-date-calendar__weekdays">
            {weekdayLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                role="columnheader"
                data-slot="weekday"
                className={cx('yuki-date-calendar__weekday', classNames?.weekday)}
              >
                {label}
              </span>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              role="row"
              className={cx('yuki-date-calendar__row', classNames?.row)}
            >
              {week.map((date) => {
                const key = toDateKey(date);
                const outside = !isSameMonth(date, month);
                const isSelected =
                  mode === 'single'
                    ? isSameDay(date, selected)
                    : isSameDay(date, resolvedRange.start) ||
                      isSameDay(date, resolvedRange.end);
                const isRangeStart = mode === 'range' && isSameDay(date, resolvedRange.start);
                const isRangeEnd = mode === 'range' && isSameDay(date, resolvedRange.end);
                const start = resolvedRange.start?.getTime() ?? null;
                const end = resolvedRange.end?.getTime() ?? null;
                const inRange =
                  mode === 'range' &&
                  start != null &&
                  end != null &&
                  date.getTime() > Math.min(start, end) &&
                  date.getTime() < Math.max(start, end);
                const isToday = isSameDay(date, today);
                const isDisabled = disabled(date);
                const isActive = isSameDay(date, activeDate);
                const dayState: DateCalendarDayState = {
                  selected: isSelected,
                  rangeStart: isRangeStart,
                  rangeEnd: isRangeEnd,
                  inRange,
                  today: isToday,
                  outside,
                  disabled: isDisabled,
                  active: isActive,
                };
                return (
                  <div
                    role="gridcell"
                    key={key}
                    aria-selected={isSelected || undefined}
                    aria-disabled={isDisabled || undefined}
                    className={cx('yuki-date-calendar__cell', classNames?.cell)}
                  >
                    {renderDay ? (
                      renderDay(date, dayState)
                    ) : (
                      <button
                        type="button"
                        data-date={key}
                        tabIndex={isActive ? 0 : -1}
                        aria-label={formatDayLabel(date, locale)}
                        aria-current={isToday ? 'date' : undefined}
                        disabled={isDisabled}
                        className={cx(
                          'yuki-date-calendar__day',
                          outside && 'yuki-date-calendar__day--outside',
                          isSelected && 'yuki-date-calendar__day--selected',
                          isRangeStart && 'yuki-date-calendar__day--range-start',
                          isRangeEnd && 'yuki-date-calendar__day--range-end',
                          inRange && 'yuki-date-calendar__day--range',
                          isToday && 'yuki-date-calendar__day--today',
                          classNames?.day,
                        )}
                        style={styles?.day}
                        onMouseEnter={() => onDayHover?.(startOfDay(date))}
                        onClick={() => {
                          if (isDisabled) return;
                          onActiveDateChange(startOfDay(date));
                          onSelect(startOfDay(date));
                        }}
                      >
                        {date.getDate()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {footer != null && (
          <div
            data-slot="footer"
            className={cx('yuki-date-calendar__footer', classNames?.footer)}
          >
            {footer}
          </div>
        )}
      </div>
    );
  },
);

DateCalendar.displayName = 'DateCalendar';

/** Helpers shared by DatePicker and DateRangePicker. */
export function monthBounds(month: Date): { from: Date; to: Date } {
  return { from: startOfMonth(month), to: endOfMonth(month) };
}
