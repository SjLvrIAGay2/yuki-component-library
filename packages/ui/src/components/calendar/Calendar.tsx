import type { StyleProperties, WithStyle } from '../../styles/properties';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon/Icon';
import {
  addDays,
  fromDateKey,
  isDateDisabled,
  isSameMonth,
  isSameDay,
  startOfDay,
  startOfMonth,
} from '../date-picker/date-utils';

export interface CalendarCellInfo {
  /** 单元格对应日期（0 点）。 */
  date: Date;
  /** 是否属于当前展示月份。 */
  inCurrentMonth: boolean;
  /** 是否被选中。 */
  selected: boolean;
  /** 是否为今天。 */
  today: boolean;
  /** 是否被禁用。 */
  disabled: boolean;
}

export interface CalendarHeaderInfo {
  /** 当前展示月份（该月 1 日）。 */
  month: Date;
  /** 已本地化的月份标题。 */
  title: ReactNode;
  prev: () => void;
  next: () => void;
}

export type CalendarHeaderRender = (info: CalendarHeaderInfo) => ReactNode;

export interface CalendarClassNames {
  root?: string;
  header?: string;
  title?: string;
  nav?: string;
  prev?: string;
  next?: string;
  weekdays?: string;
  weekday?: string;
  grid?: string;
  row?: string;
  cell?: string;
  button?: string;
}

export interface CalendarStyles {
  root?: StyleProperties;
  header?: StyleProperties;
  title?: StyleProperties;
  nav?: StyleProperties;
  prev?: StyleProperties;
  next?: StyleProperties;
  weekdays?: StyleProperties;
  weekday?: StyleProperties;
  grid?: StyleProperties;
  row?: StyleProperties;
  cell?: StyleProperties;
  button?: StyleProperties;
}

export interface CalendarProps extends Omit<
  WithStyle<HTMLAttributes<HTMLDivElement>>,
  'onChange' | 'onSelect' | 'defaultValue' | 'value'
> {
  /** 受控选中日期。 */
  value?: Date | null;
  /** 非受控初始选中日期。 */
  defaultValue?: Date | null;
  /** 选中日期变化时触发。 */
  onSelect?: (date: Date) => void;
  /** 受控展示月份（取该月任意日期）。 */
  month?: Date;
  /** 非受控初始展示月份。 */
  defaultMonth?: Date;
  /** 展示月份变化时触发。 */
  onMonthChange?: (month: Date) => void;
  /** 一周从周几开始，0 为周日。 */
  weekStart?: number;
  /** 可选的最早和最晚日期，支持 Date 和本地 YYYY-MM-DD 字符串。 */
  min?: Date | string;
  max?: Date | string;
  /** 禁用某些日期。 */
  disabledDate?: (date: Date) => boolean;
  /** 自定义单元格内容。 */
  cellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  /** 自定义头部（月份标题 + 上/下月切换）。 */
  headerRender?: CalendarHeaderRender;
  /** 尺寸。 */
  size?: Size;
  /** 是否显示外边框。 */
  bordered?: boolean;
  classNames?: CalendarClassNames;
  styles?: CalendarStyles;
}

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** 月视图日历，支持受控/非受控选中与月份、单元格自定义与键盘导航。 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(inputProps, ref) {
    const props = useComponentDefaults('Calendar', inputProps);
    const {
      value: valueProp,
      defaultValue,
      onSelect,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      weekStart = 0,
      min,
      max,
      disabledDate,
      cellRender,
      headerRender,
      size: sizeProp,
      bordered = true,
      className,
      classNames,
      styles,
      style,
      ...rest
    } = props;

    const size = useComponentSize(sizeProp);
    const { locale, t } = useLocale();
    const isZh = locale.name.toLowerCase().startsWith('zh');
    const weekStartIndex = ((weekStart % 7) + 7) % 7;

    const minDate = useMemo(() => (typeof min === 'string' ? fromDateKey(min) : min), [min]);
    const maxDate = useMemo(() => (typeof max === 'string' ? fromDateKey(max) : max), [max]);
    const isDisabled = useCallback(
      (day: Date) => isDateDisabled(day, { min: minDate, max: maxDate, disabledDate }),
      [minDate, maxDate, disabledDate],
    );
    const normalizedMonthProp = useMemo(
      () => (monthProp ? startOfMonth(monthProp) : undefined),
      [monthProp],
    );

    const [value, setValue] = useControllableState<Date | null>({
      value: valueProp,
      defaultValue: defaultValue ?? null,
      onChange: (next) => {
        if (next) onSelect?.(next);
      },
    });

    const [month, setMonth] = useControllableState<Date>({
      value: normalizedMonthProp,
      defaultValue: startOfMonth(
        defaultMonth ?? valueProp ?? defaultValue ?? minDate ?? maxDate ?? new Date(),
      ),
      onChange: onMonthChange,
    });

    const [focused, setFocused] = useState<Date>(() => value ?? startOfMonth(month));
    // Browsing other months remains possible while the selected day stays the same.
    const selectedDay = valueProp ? startOfDay(valueProp).getTime() : undefined;
    const previousSelectedDay = useRef(selectedDay);
    useEffect(() => {
      if (previousSelectedDay.current === selectedDay) return;
      previousSelectedDay.current = selectedDay;
      if (selectedDay === undefined) return;
      const next = new Date(selectedDay);
      setFocused(next);
      if (!monthProp && !isSameMonth(next, month)) setMonth(startOfMonth(next));
    }, [selectedDay, monthProp, month, setMonth]);
    const today = useMemo(() => new Date(), []);

    const cellRefs = useRef(new Map<number, HTMLButtonElement>());
    const pendingFocus = useRef<number | null>(null);

    useEffect(() => {
      const stamp = pendingFocus.current;
      if (stamp === null) return;
      pendingFocus.current = null;
      cellRefs.current.get(stamp)?.focus();
    });

    const monthStart = startOfMonth(month);
    const leading = (monthStart.getDay() - weekStartIndex + 7) % 7;
    const gridStart = addDays(monthStart, -leading);
    const cells = useMemo(
      () => Array.from({ length: 42 }, (_, index) => addDays(gridStart, index)),
      // gridStart 是派生值，用时间戳作为依赖更直观
      [gridStart.getTime()],
    );

    const tabbableDate =
      isSameMonth(focused, month) && !isDisabled(focused)
        ? focused
        : cells.find((day) => isSameMonth(day, month) && !isDisabled(day));

    const title = useMemo(() => {
      if (isZh) {
        return t(
          'calendar.monthTitle',
          { 'zh-CN': '{year} 年 {month} 月', 'en-US': '{month} {year}' },
          { year: month.getFullYear(), month: month.getMonth() + 1 },
        );
      }
      return t(
        'calendar.monthTitle',
        { 'zh-CN': '{year} 年 {month} 月', 'en-US': '{month} {year}' },
        { year: month.getFullYear(), month: MONTHS_EN[month.getMonth()] ?? '' },
      );
    }, [isZh, month, t]);

    const changeMonth = useCallback(
      (offset: number) => {
        const next = addMonths(month, offset);
        setMonth(next);
        const day = Math.min(focused.getDate(), daysInMonth(next));
        setFocused(new Date(next.getFullYear(), next.getMonth(), day));
      },
      [focused, month, setMonth],
    );

    const selectDate = useCallback(
      (date: Date) => {
        if (isDisabled(date)) return;
        setValue(date);
        setFocused(date);
        const outside =
          date.getFullYear() !== month.getFullYear() || date.getMonth() !== month.getMonth();
        if (outside) {
          setMonth(startOfMonth(date));
          pendingFocus.current = date.getTime();
        }
      },
      [isDisabled, month, setMonth, setValue],
    );

    const moveFocus = useCallback(
      (date: Date) => {
        setFocused(date);
        const nextMonth = startOfMonth(date);
        if (
          nextMonth.getFullYear() !== month.getFullYear() ||
          nextMonth.getMonth() !== month.getMonth()
        ) {
          setMonth(nextMonth);
        }
        pendingFocus.current = date.getTime();
      },
      [month, setMonth],
    );

    const handleCellKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
        let next: Date | null = null;
        switch (event.key) {
          case 'ArrowLeft':
            next = addDays(date, -1);
            break;
          case 'ArrowRight':
            next = addDays(date, 1);
            break;
          case 'ArrowUp':
            next = addDays(date, -7);
            break;
          case 'ArrowDown':
            next = addDays(date, 7);
            break;
          case 'Home':
            next = addDays(date, -((date.getDay() - weekStartIndex + 7) % 7));
            break;
          case 'End':
            next = addDays(date, 6 - ((date.getDay() - weekStartIndex + 7) % 7));
            break;
          case 'PageUp':
            next = new Date(
              date.getFullYear(),
              date.getMonth() - 1,
              Math.min(date.getDate(), daysInMonth(addMonths(date, -1))),
            );
            break;
          case 'PageDown':
            next = new Date(
              date.getFullYear(),
              date.getMonth() + 1,
              Math.min(date.getDate(), daysInMonth(addMonths(date, 1))),
            );
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            selectDate(date);
            return;
          default:
            return;
        }
        event.preventDefault();
        if (isDisabled(next)) {
          // Stay in the target month when looking beyond a disabled day.
          const direction = next >= date ? 1 : -1;
          const target = next;
          do {
            next = addDays(next, direction);
            if (!isSameMonth(next, target)) return;
          } while (isDisabled(next));
        }
        moveFocus(next);
      },
      [isDisabled, moveFocus, selectDate, weekStartIndex],
    );

    const handleCellClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>, date: Date) => {
        if (event.button !== 0) return;
        selectDate(date);
      },
      [selectDate],
    );

    const weekdays = useMemo(() => {
      const labels = t('common.weekdaysShort', {
        'zh-CN': '日,一,二,三,四,五,六',
        'en-US': 'Su,Mo,Tu,We,Th,Fr,Sa',
      }).split(',');
      return Array.from({ length: 7 }, (_, index) => labels[(index + weekStartIndex) % 7] ?? '');
    }, [t, weekStartIndex]);

    const rows: Date[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      rows.push(cells.slice(index, index + 7));
    }

    const titleNode = (
      <div
        className={cx('yuki-calendar__title', classNames?.title)}
        data-slot="title"
        aria-live="polite"
        style={styles?.title}
      >
        {title}
      </div>
    );

    const defaultHeader = (
      <div
        className={cx('yuki-calendar__header', classNames?.header)}
        data-slot="header"
        style={styles?.header}
      >
        <div
          className={cx('yuki-calendar__nav', classNames?.nav)}
          data-slot="nav"
          style={styles?.nav}
        >
          <button
            type="button"
            className={cx('yuki-calendar__prev', classNames?.prev)}
            data-slot="prev"
            style={styles?.prev}
            aria-label={t('calendar.prevMonth', {
              'zh-CN': '上个月',
              'en-US': 'Previous month',
            })}
            onClick={() => changeMonth(-1)}
          >
            <Icon name="chevron-left" />
          </button>
          <button
            type="button"
            className={cx('yuki-calendar__next', classNames?.next)}
            data-slot="next"
            style={styles?.next}
            aria-label={t('calendar.nextMonth', {
              'zh-CN': '下个月',
              'en-US': 'Next month',
            })}
            onClick={() => changeMonth(1)}
          >
            <Icon name="chevron-right" />
          </button>
        </div>
        {titleNode}
      </div>
    );

    return (
      <div
        ref={ref}
        {...rest}
        data-slot="calendar"
        data-size={size}
        data-bordered={bordered || undefined}
        data-week-start={weekStartIndex}
        className={cx(
          'yuki-calendar',
          `yuki-calendar--${size}`,
          bordered && 'yuki-calendar--bordered',
          classNames?.root,
          className,
        )}
        style={{ ...styles?.root, ...style }}
      >
        {headerRender
          ? headerRender({
              month,
              title,
              prev: () => changeMonth(-1),
              next: () => changeMonth(1),
            })
          : defaultHeader}
        <div
          className={cx('yuki-calendar__weekdays', classNames?.weekdays)}
          data-slot="weekdays"
          role="row"
          style={styles?.weekdays}
        >
          {weekdays.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className={cx('yuki-calendar__weekday', classNames?.weekday)}
              data-slot="weekday"
              role="columnheader"
              style={styles?.weekday}
            >
              {label}
            </span>
          ))}
        </div>
        <div
          className={cx('yuki-calendar__grid', classNames?.grid)}
          data-slot="grid"
          role="grid"
          aria-label={title}
          style={styles?.grid}
        >
          {rows.map((row, rowIndex) => (
            <div
              key={`week-${rowIndex}`}
              className={cx('yuki-calendar__row', classNames?.row)}
              data-slot="row"
              role="row"
              style={styles?.row}
            >
              {row.map((date) => {
                const selected = value ? isSameDay(date, value) : false;
                const isToday = isSameDay(date, today);
                const disabled = isDisabled(date);
                const inCurrentMonth =
                  date.getMonth() === month.getMonth() &&
                  date.getFullYear() === month.getFullYear();
                const info: CalendarCellInfo = {
                  date,
                  inCurrentMonth,
                  selected,
                  today: isToday,
                  disabled,
                };
                const content = cellRender?.(date, info);
                const stamp = date.getTime();
                return (
                  <div
                    key={stamp}
                    className={cx('yuki-calendar__cell', classNames?.cell)}
                    data-slot="cell"
                    role="gridcell"
                    aria-selected={selected}
                    aria-current={isToday ? 'date' : undefined}
                    aria-disabled={disabled || undefined}
                    data-outside={!inCurrentMonth || undefined}
                    data-selected={selected || undefined}
                    data-today={isToday || undefined}
                    data-disabled={disabled || undefined}
                    style={styles?.cell}
                  >
                    <button
                      ref={(node) => {
                        if (node) cellRefs.current.set(stamp, node);
                        else cellRefs.current.delete(stamp);
                      }}
                      type="button"
                      className={cx('yuki-calendar__button', classNames?.button)}
                      data-slot="cell-button"
                      style={styles?.button}
                      disabled={disabled}
                      tabIndex={isSameDay(date, tabbableDate) ? 0 : -1}
                      onFocus={() => setFocused(date)}
                      onClick={(event) => handleCellClick(event, date)}
                      onKeyDown={(event) => handleCellKeyDown(event, date)}
                    >
                      {content ?? date.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Calendar.displayName = 'Calendar';
