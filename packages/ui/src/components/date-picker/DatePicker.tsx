import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  StandaloneField,
  useStandaloneField,
  fieldDescription,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import { useFieldControl } from '../form/context';
import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { Popup } from '../../internal/Popup';
import { useClickOutside, useControllableState, useEscapeKey, useMergedRefs } from '../../hooks';
import type { Placement } from '../../hooks';
import { useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { SelectTrigger } from '../select/select-shared';
import type { SelectStatus } from '../select/select-utils';
import {
  DateCalendar,
  type DateCalendarClassNames,
  type DateCalendarDayState,
  type DateCalendarStyles,
} from './DateCalendar';
import {
  formatDateLabel,
  isDateDisabled,
  isSameMonth,
  startOfDay,
  startOfMonth,
  toDateKey,
  type DatePickerValue,
} from './date-utils';

export interface DatePickerClassNames {
  root?: string;
  trigger?: string;
  panel?: string;
  footer?: string;
  today?: string;
  value?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  clear?: string;
  arrow?: string;
  calendar?: DateCalendarClassNames;
}

export interface DatePickerStyles {
  root?: StyleProperties;
  trigger?: StyleProperties;
  panel?: StyleProperties;
  calendar?: DateCalendarStyles;
}

export interface DatePickerProps
  extends
    StandaloneFieldProps,
    Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
  /** Controlled value; `null` clears it. */
  value?: DatePickerValue;
  defaultValue?: DatePickerValue;
  onChange?: (value: Date | null) => void;
  onClear?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: Size;
  placeholder?: ReactNode;
  disabled?: boolean;
  /** Focusable but not editable; the panel never opens. */
  readOnly?: boolean;
  invalid?: boolean;
  status?: SelectStatus;
  clearable?: boolean;
  /** Earliest selectable day (inclusive). */
  min?: Date;
  /** Latest selectable day (inclusive). */
  max?: Date;
  disabledDate?: (date: Date) => boolean;
  /** 0 = Sunday … 6 = Saturday. */
  weekStartsOn?: number;
  /** Custom value formatter; defaults to a locale aware long date. */
  format?: (date: Date) => string;
  /** Custom renderer for a calendar day. */
  renderDay?: (date: Date, state: DateCalendarDayState) => ReactNode;
  /** Show the "today" shortcut in the panel footer. */
  showToday?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showArrow?: boolean;
  borderless?: boolean;
  placement?: Placement;
  name?: string;
  required?: boolean;
  classNames?: DatePickerClassNames;
  styles?: DatePickerStyles;
}

function todayStart(): Date {
  return startOfDay(new Date());
}

function DatePickerInner(inputProps: DatePickerProps, forwardedRef: Ref<HTMLDivElement>) {
  const {
    control: props,
    frame,
    controlStyle,
    controlClassName,
  } = useStandaloneField(useComponentDefaults('DatePicker', inputProps));
  const {
    value: valueProp,
    defaultValue = null,
    onChange,
    onClear,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    size: sizeProp,
    placeholder,
    disabled: disabledProp = false,
    readOnly = false,
    invalid: invalidProp = false,
    status: statusProp,
    clearable = false,
    min,
    max,
    disabledDate,
    weekStartsOn = 0,
    format,
    renderDay,
    showToday = true,
    prefix,
    suffix,
    showArrow = true,
    borderless = false,
    placement = 'bottom',
    name,
    required: requiredProp = false,
    classNames,
    styles,
    className,
    style,
    id,
    onKeyDown,
    ...rest
  } = props;
  const field = useFieldControl<DatePickerValue>({
    value: valueProp,
    id,
    status: statusProp,
    disabled: disabledProp,
  });
  const disabled = field.disabled;
  const invalid = invalidProp || frame.invalid || field.status === 'error';
  const status = frame.invalid ? 'error' : field.status === 'default' ? undefined : field.status;
  const required = requiredProp || field.required;
  const size = useComponentSize(sizeProp);
  const { t, locale } = useLocale();
  const baseId = useId();
  const triggerId = field.id ?? baseId + '-trigger';
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mergedRootRef = useMergedRefs(rootRef, forwardedRef);

  const interactive = !disabled && !readOnly && !rest.hidden && !frame.fieldProps?.hidden;
  const [requestedOpen, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = interactive && requestedOpen;
  const [value, setValue] = useControllableState<DatePickerValue>({
    value: field.bound ? (field.value ?? null) : valueProp,
    defaultValue,
    onChange: (next) => {
      onChange?.(next);
      field.onChange?.(next);
    },
  });

  const [month, setMonth] = useState<Date>(() => startOfMonth(value ?? todayStart()));
  const [activeDate, setActiveDate] = useState<Date>(() => startOfDay(value ?? todayStart()));

  const localeName = locale.name;

  const formatLabel = useCallback(
    (date: Date) => format?.(date) ?? formatDateLabel(date, localeName),
    [format, localeName],
  );

  const openPanel = useCallback(() => {
    if (!interactive) return;
    const anchor = value ?? todayStart();
    setMonth(startOfMonth(anchor));
    setActiveDate(startOfDay(anchor));
    setOpen(true);
  }, [interactive, value, setOpen]);

  const close = useCallback(
    (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  const commit = useCallback(
    (date: Date) => {
      setValue(date);
      setActiveDate(date);
      close(true);
    },
    [setValue, close],
  );

  const clearValue = () => {
    if (!interactive) return;
    setValue(null);
    onClear?.();
    close(true);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
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

  const triggerValue = value ? formatLabel(value) : null;
  const hasValue = value != null;

  const footer =
    showToday && interactive ? (
      <button
        type="button"
        data-slot="today"
        className={cx('yuki-date-picker__today', classNames?.today)}
        onClick={() => {
          const today = todayStart();
          if (isDateDisabled(today, { min, max, disabledDate })) return;
          commit(today);
        }}
      >
        {t('datePicker.today', { zh: '今天', en: 'Today' })}
      </button>
    ) : undefined;

  return (
    <StandaloneField
      frame={frame}
      id={triggerId}
      hidden={rest.hidden}
      required={required}
      focusControl={() => triggerRef.current?.focus()}
    >
      <div
        ref={mergedRootRef}
        data-slot="date-picker"
        data-size={size}
        data-open={open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-invalid={invalid || status === 'error' ? '' : undefined}
        data-status={status}
        data-value={value ? toDateKey(value) : undefined}
        className={cx('yuki-select-root', 'yuki-date-picker', className, classNames?.root)}
        style={{ ...style, ...styles?.root }}
      >
        {name != null && (
          <input
            type="hidden"
            name={name}
            value={value ? toDateKey(value) : ''}
            disabled={disabled}
            required={required}
          />
        )}
        <SelectTrigger
          {...rest}
          ref={triggerRef}
          id={triggerId}
          aria-invalid={invalid || rest['aria-invalid']}
          aria-labelledby={
            rest['aria-labelledby'] ??
            (frame.hasLabel ? (frame.labelProps?.id ?? triggerId + '-label') : field.labelId)
          }
          aria-describedby={fieldDescription(
            frame,
            triggerId,
            rest['aria-describedby'],
            field.ariaProps['aria-describedby'],
          )}
          aria-busy={field.ariaProps['aria-busy'] ?? rest['aria-busy']}
          onBlur={(event) => {
            rest.onBlur?.(event);
            field.onBlur?.();
          }}
          role="combobox"
          open={open}
          size={size}
          disabled={disabled}
          invalid={invalid}
          status={status}
          borderless={borderless}
          placeholder={
            placeholder ?? t('datePicker.placeholder', { zh: '请选择日期', en: 'Select date' })
          }
          value={triggerValue}
          hasValue={hasValue}
          prefix={prefix ?? <Icon name="calendar" size="1em" />}
          suffix={suffix}
          showArrow={showArrow}
          clearable={clearable && !readOnly}
          onClear={clearValue}
          clearLabel={t('common.clear', { zh: '清除', en: 'Clear' })}
          aria-haspopup="dialog"
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          className={cx(classNames?.trigger, controlClassName)}
          classNames={{
            value: classNames?.value,
            placeholder: classNames?.placeholder,
            prefix: classNames?.prefix,
            suffix: classNames?.suffix,
            clear: classNames?.clear,
            arrow: classNames?.arrow,
          }}
          style={{ ...styles?.trigger, ...controlStyle }}
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
          open={open}
          anchorRef={triggerRef}
          placement={placement}
          role="dialog"
          aria-label={t('datePicker.dialog', { zh: '选择日期', en: 'Choose date' })}
        >
          <div
            ref={panelRef}
            data-slot="panel"
            className={cx('yuki-date-picker__panel', classNames?.panel)}
            style={styles?.panel}
          >
            <DateCalendar
              month={month}
              onMonthChange={(next) => setMonth(startOfMonth(next))}
              activeDate={activeDate}
              onActiveDateChange={(next) => {
                setActiveDate(next);
                if (!isSameMonth(next, month)) setMonth(startOfMonth(next));
              }}
              selected={value}
              onSelect={commit}
              min={min}
              max={max}
              disabledDate={disabledDate}
              weekStartsOn={weekStartsOn}
              locale={localeName}
              labels={{
                prevMonth: t('datePicker.prevMonth', { zh: '上个月', en: 'Previous month' }),
                nextMonth: t('datePicker.nextMonth', { zh: '下个月', en: 'Next month' }),
              }}
              footer={footer}
              autoFocus
              renderDay={renderDay}
              classNames={classNames?.calendar}
              styles={styles?.calendar}
            />
          </div>
        </Popup>
      </div>
    </StandaloneField>
  );
}

/**
 * DatePicker built on the shared form-family trigger and a keyboard-first
 * calendar grid. The calendar itself is shared with DateRangePicker.
 */
export const DatePicker = forwardRef(DatePickerInner) as (
  props: DatePickerProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

(DatePicker as { displayName?: string }).displayName = 'DatePicker';

export default DatePicker;
