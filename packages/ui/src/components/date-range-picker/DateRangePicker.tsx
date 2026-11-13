import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { Popup } from '../../internal/Popup';
import {
  useClickOutside,
  useControllableState,
  useEscapeKey,
  useMergedRefs,
} from '../../hooks';
import type { Placement } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { useFieldControl } from '../form/context';
import { SelectTrigger } from '../select/select-shared';
import type { SelectStatus } from '../select/select-utils';
import {
  DateCalendar,
  type DateCalendarClassNames,
  type DateCalendarDayState,
  type DateCalendarStyles,
} from '../date-picker/DateCalendar';
import {
  formatDateLabel,
  isDateDisabled,
  isSameMonth,
  startOfDay,
  startOfMonth,
  toDateKey,
  type DateRange,
  type DatePickerValue,
} from '../date-picker/date-utils';

export interface DateRangePickerPreset {
  label: ReactNode;
  value: DateRange;
}

export interface DateRangePickerClassNames {
  root?: string;
  trigger?: string;
  panel?: string;
  presets?: string;
  preset?: string;
  summary?: string;
  separator?: string;
  start?: string;
  end?: string;
  value?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  clear?: string;
  arrow?: string;
  calendar?: DateCalendarClassNames;
}

export interface DateRangePickerStyles {
  root?: CSSProperties;
  trigger?: CSSProperties;
  panel?: CSSProperties;
  calendar?: DateCalendarStyles;
}

export interface DateRangePickerProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue' | 'value' | 'prefix'
  > {
  /** Controlled range; `null` clears it. */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (range: { start: Date; end: Date } | null) => void;
  onClear?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: Size;
  startPlaceholder?: ReactNode;
  endPlaceholder?: ReactNode;
  /** Rendered between the start and end labels. Defaults to `~`. */
  separator?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  status?: SelectStatus;
  clearable?: boolean;
  min?: Date;
  max?: Date;
  disabledDate?: (date: Date) => boolean;
  weekStartsOn?: number;
  format?: (date: Date) => string;
  renderDay?: (date: Date, state: DateCalendarDayState) => ReactNode;
  /** Quick range shortcuts rendered above the calendar. */
  presets?: DateRangePickerPreset[];
  prefix?: ReactNode;
  suffix?: ReactNode;
  showArrow?: boolean;
  borderless?: boolean;
  placement?: Placement;
  name?: string;
  required?: boolean;
  classNames?: DateRangePickerClassNames;
  styles?: DateRangePickerStyles;
}

function todayStart(): Date {
  return startOfDay(new Date());
}

type CompleteRange = { start: Date; end: Date };

function normalizeRange(range: DateRange | null | undefined): CompleteRange | null {
  const start = range?.start ?? null;
  const end = range?.end ?? null;
  if (!start || !end) return null;
  return start.getTime() <= end.getTime()
    ? { start: startOfDay(start), end: startOfDay(end) }
    : { start: startOfDay(end), end: startOfDay(start) };
}

function DateRangePickerInner(
  inputProps: DateRangePickerProps,
  forwardedRef: Ref<HTMLDivElement>,
) {
  const {
    value: valueProp,
    defaultValue = null,
    onChange,
    onClear,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    size: sizeProp,
    startPlaceholder,
    endPlaceholder,
    separator,
    disabled: disabledProp,
    readOnly = false,
    invalid: invalidProp,
    status: statusProp,
    clearable = false,
    min,
    max,
    disabledDate,
    weekStartsOn = 0,
    format,
    renderDay,
    presets,
    prefix,
    suffix,
    showArrow = true,
    borderless = false,
    placement = 'bottom',
    name,
    required: requiredProp,
    classNames,
    styles,
    className,
    style,
    id,
    onKeyDown,
    ...rest
  } = useComponentDefaults('DateRangePicker', inputProps);
  const field = useFieldControl<DateRange | null>({ id, value: valueProp, disabled: disabledProp, status: statusProp });
  const disabled = field.disabled;
  const status = field.status === 'default' ? undefined : field.status;
  const invalid = invalidProp || status === 'error';
  const required = requiredProp || field.required;
  const interactive = !disabled && !readOnly && !rest.hidden;
  const size = useComponentSize(sizeProp);
  const { t, locale } = useLocale();
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mergedRootRef = useMergedRefs(rootRef, forwardedRef);

  const [requestedOpen, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = requestedOpen && interactive;
  const [value, setValue] = useControllableState<DateRange | null>({
    value: field.bound ? (field.value ?? null) : valueProp,
    defaultValue,
    onChange: (next) => {
      const complete = normalizeRange(next);
      onChange?.(complete);
      field.onChange?.(complete);
    },
  });

  const normalized = normalizeRange(value);
  const anchorDate: DatePickerValue = normalized?.start ?? null;

  const [draft, setDraft] = useState<DateRange | null>(normalized);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date>(() => startOfMonth(anchorDate ?? todayStart()));
  const [activeDate, setActiveDate] = useState<Date>(() => startOfDay(anchorDate ?? todayStart()));

  const localeName = locale.name;

  const formatLabel = useCallback(
    (date: Date | null | undefined) =>
      date ? (format?.(date) ?? formatDateLabel(date, localeName)) : '',
    [format, localeName],
  );

  const openPanel = useCallback(() => {
    if (!interactive) return;
    const anchor = normalized?.start ?? todayStart();
    setDraft(normalized);
    setHoverDate(null);
    setMonth(startOfMonth(anchor));
    setActiveDate(startOfDay(anchor));
    setOpen(true);
  }, [interactive, normalized, setOpen]);

  const close = useCallback(
    (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  const commit = useCallback(
    (range: DateRange) => {
      const next = normalizeRange(range);
      if (!next) return;
      setValue(next as DateRange);
      setDraft(next);
      close(true);
    },
    [setValue, close],
  );

  const handleSelect = (date: Date) => {
    if (!draft?.start || (draft.start && draft.end)) {
      setDraft({ start: startOfDay(date), end: null });
      setHoverDate(null);
      return;
    }
    const start = draft.start;
    commit(
      date.getTime() < start.getTime()
        ? { start: date, end: start }
        : { start, end: date },
    );
  };

  const clearValue = () => {
    if (!interactive) return;
    setValue(null);
    onClear?.();
    close(true);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPanel();
        return;
      }
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
    }
  };

  useEffect(() => {
    if (!interactive && requestedOpen) setOpen(false);
  }, [interactive, requestedOpen, setOpen]);

  useClickOutside([rootRef, panelRef], () => setOpen(false), open);
  useEscapeKey(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, open);

  const hasValue = normalized != null;
  const startText = formatLabel(normalized?.start);
  const endText = formatLabel(normalized?.end);

  const renderRange = (start: ReactNode, end: ReactNode) => (
    <span
      data-slot="value"
      className={cx('yuki-date-range-picker__value', classNames?.value)}
    >
      <span
        data-slot="start"
        className={cx('yuki-date-range-picker__start', classNames?.start)}
      >
        {start}
      </span>
      <span
        aria-hidden="true"
        data-slot="separator"
        className={cx('yuki-date-range-picker__separator', classNames?.separator)}
      >
        {separator ?? '~'}
      </span>
      <span data-slot="end" className={cx('yuki-date-range-picker__end', classNames?.end)}>
        {end}
      </span>
    </span>
  );

  const summaryText =
    draft?.start && draft.end
      ? <>{formatLabel(draft.start)} {separator ?? '~'} {formatLabel(draft.end)}</>
      : draft?.start
        ? <>{formatLabel(draft.start)} {separator ?? '~'} …</>
        : t('dateRangePicker.hint', {
            zh: '先选择开始日期，再选择结束日期',
            en: 'Pick a start date, then an end date',
          });

  return (
    <div
      ref={mergedRootRef}
      hidden={rest.hidden}
      data-slot="date-range-picker"
      data-size={size}
      data-open={open ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      data-status={status}
      data-range-start={normalized?.start ? toDateKey(normalized.start) : undefined}
      data-range-end={normalized?.end ? toDateKey(normalized.end) : undefined}
      className={cx(
        'yuki-select-root',
        'yuki-date-range-picker',
        className,
        classNames?.root,
      )}
      style={{ ...style, ...styles?.root }}
    >
      {name != null && (
        <input
          type="hidden"
          name={name}
          value={
            normalized?.start && normalized.end
              ? `${toDateKey(normalized.start)}~${toDateKey(normalized.end)}`
              : ''
          }
          disabled={disabled}
          required={required}
        />
      )}
      <SelectTrigger
        {...rest}
        ref={triggerRef}
        {...field.ariaProps}
        id={field.id ?? `${baseId}-trigger`}
        aria-labelledby={rest['aria-labelledby'] ?? field.labelId}
        aria-describedby={[rest['aria-describedby'], field.ariaProps['aria-describedby']].filter(Boolean).join(' ') || undefined}
        aria-invalid={invalid || rest['aria-invalid']}
        aria-controls={open ? `${baseId}-dialog` : undefined}
        role="combobox"
        open={open}
        size={size}
        disabled={disabled}
        invalid={invalid}
        status={status}
        borderless={borderless}
        hasValue={hasValue}
        value={renderRange(startText, endText)}
        placeholder={renderRange(
          startPlaceholder ??
            t('dateRangePicker.start', { zh: '开始日期', en: 'Start date' }),
          endPlaceholder ?? t('dateRangePicker.end', { zh: '结束日期', en: 'End date' }),
        )}
        prefix={prefix ?? <Icon name="calendar" size="1em" />}
        suffix={suffix}
        showArrow={showArrow}
        clearable={clearable && !readOnly}
        onClear={clearValue}
        clearLabel={t('common.clear', { zh: '清除', en: 'Clear' })}
        aria-haspopup="dialog"
        aria-required={required || undefined}
        aria-readonly={readOnly || undefined}
        className={cx('yuki-date-range-picker__trigger', classNames?.trigger)}
        classNames={{
          value: classNames?.value,
          placeholder: classNames?.placeholder,
          prefix: classNames?.prefix,
          suffix: classNames?.suffix,
          clear: classNames?.clear,
          arrow: classNames?.arrow,
        }}
        style={styles?.trigger}
        onBlur={(event) => {
          rest.onBlur?.(event);
          field.onBlur?.();
        }}
        onClick={(event) => {
          rest.onClick?.(event);
          if (event.defaultPrevented || !interactive) return;
          if (open) close(false);
          else openPanel();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) onTriggerKeyDown(event);
        }}
      />
      <Popup
        id={`${baseId}-dialog`}
        open={open}
        anchorRef={triggerRef}
        placement={placement}
        role="dialog"
        aria-label={t('dateRangePicker.dialog', {
          zh: '选择日期范围',
          en: 'Choose date range',
        })}
      >
        <div
          ref={panelRef}
          data-slot="panel"
          className={cx('yuki-date-range-picker__panel', classNames?.panel)}
          style={styles?.panel}
        >
          {presets && presets.length > 0 && (
            <div
              data-slot="presets"
              className={cx('yuki-date-range-picker__presets', classNames?.presets)}
            >
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  data-slot="preset"
                  disabled={!preset.value.start || !preset.value.end ||
                    isDateDisabled(preset.value.start, { min, max, disabledDate }) ||
                    isDateDisabled(preset.value.end, { min, max, disabledDate })}
                  className={cx('yuki-date-range-picker__preset', classNames?.preset)}
                  onClick={() => commit(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <DateCalendar
            month={month}
            onMonthChange={(next) => setMonth(startOfMonth(next))}
            activeDate={activeDate}
            onActiveDateChange={(next) => {
              setActiveDate(next);
              if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
            }}
            mode="range"
            range={draft ?? undefined}
            rangeHover={hoverDate}
            onDayHover={setHoverDate}
            onSelect={handleSelect}
            min={min}
            max={max}
            disabledDate={disabledDate}
            weekStartsOn={weekStartsOn}
            locale={localeName}
            labels={{
              prevMonth: t('datePicker.prevMonth', { zh: '上个月', en: 'Previous month' }),
              nextMonth: t('datePicker.nextMonth', { zh: '下个月', en: 'Next month' }),
            }}
            footer={
              <span
                data-slot="summary"
                className={cx('yuki-date-range-picker__summary', classNames?.summary)}
              >
                {summaryText}
              </span>
            }
            autoFocus
            renderDay={renderDay}
            classNames={classNames?.calendar}
            styles={styles?.calendar}
          />
        </div>
      </Popup>
    </div>
  );
}

/**
 * Range picker sharing the calendar contract with DatePicker: pick a start,
 * preview the span on hover, pick an end. Supports quick presets.
 */
export const DateRangePicker = forwardRef(DateRangePickerInner) as (
  props: DateRangePickerProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

(DateRangePicker as { displayName?: string }).displayName = 'DateRangePicker';

export default DateRangePicker;

// Re-exported so consumers can type disabled-day predicates without reaching
// into internal modules.
export type { DateRange } from '../date-picker/date-utils';
export { isDateDisabled };
