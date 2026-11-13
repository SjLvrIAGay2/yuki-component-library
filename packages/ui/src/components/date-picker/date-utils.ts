/** Shared date math for DatePicker and DateRangePicker. */

export type DatePickerValue = Date | null;

export const MS_PER_DAY = 86_400_000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** `2026-11-14` key used for `data-date` and stable test lookups. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const [, year, month, day] = match;
  if (!year || !month || !day) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Normalize a value that may arrive as a date string. */
export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export function isDateDisabled(
  date: Date,
  options: {
    min?: Date | null;
    max?: Date | null;
    disabledDate?: (date: Date) => boolean;
  },
): boolean {
  const day = startOfDay(date);
  if (options.min && day.getTime() < startOfDay(options.min).getTime()) return true;
  if (options.max && day.getTime() > startOfDay(options.max).getTime()) return true;
  return Boolean(options.disabledDate?.(day));
}

export function getWeekdayLabels(weekStartsOn: number, locale: string): string[] {
  // 2023-01-01 was a Sunday, which keeps the reference week stable.
  const sunday = new Date(2023, 0, 1);
  return Array.from({ length: 7 }, (_, index) =>
    addDays(sunday, (weekStartsOn + index) % 7).toLocaleDateString(locale, {
      weekday: 'narrow',
    }),
  );
}

/**
 * 6x7 calendar matrix for a month, starting on `weekStartsOn` (0 = Sunday).
 * Padding days belong to the previous / next month.
 */
export function getCalendarWeeks(month: Date, weekStartsOn: number): Date[][] {
  const first = startOfMonth(month);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -offset);
  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) =>
      addDays(gridStart, weekIndex * 7 + dayIndex),
    ),
  );
}

/** Format a date for the trigger, e.g. `2026年11月14日`. */
export function formatDateLabel(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string {
  return date.toLocaleDateString(locale, options);
}

/** Long, screen-reader friendly label for a calendar day. */
export function formatDayLabel(date: Date, locale: string): string {
  return formatDateLabel(date, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/** Month + year heading, e.g. `2026年11月`. */
export function formatMonthLabel(date: Date, locale: string): string {
  return formatDateLabel(date, locale, { year: 'numeric', month: 'long' });
}
