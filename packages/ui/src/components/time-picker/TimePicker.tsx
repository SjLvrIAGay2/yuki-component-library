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
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
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
  clampParts,
  compareParts,
  formatTime,
  getNowParts,
  getStepValues,
  padTwo,
  parseTime,
  sameParts,
  type TimeParts,
} from './time-utils';

export interface TimePickerClassNames {
  root?: string;
  trigger?: string;
  panel?: string;
  header?: string;
  columns?: string;
  column?: string;
  columnTitle?: string;
  columnList?: string;
  option?: string;
  footer?: string;
  now?: string;
  value?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  clear?: string;
  arrow?: string;
}

export interface TimePickerStyles {
  root?: CSSProperties;
  trigger?: CSSProperties;
  panel?: CSSProperties;
  columns?: CSSProperties;
}

export interface TimePickerProps
  extends
    StandaloneFieldProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
  /** Controlled `HH:mm` or `HH:mm:ss` value. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  onClear?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: Size;
  placeholder?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  status?: SelectStatus;
  clearable?: boolean;
  /** Render a seconds column and include seconds in the value. */
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  /** Earliest selectable time (`HH:mm` or `HH:mm:ss`). */
  min?: string;
  /** Latest selectable time (`HH:mm` or `HH:mm:ss`). */
  max?: string;
  /** Custom display formatter for the trigger value. */
  format?: (value: string) => string;
  /** Show the "now" shortcut in the panel footer. */
  showNow?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showArrow?: boolean;
  borderless?: boolean;
  placement?: Placement;
  name?: string;
  required?: boolean;
  classNames?: TimePickerClassNames;
  styles?: TimePickerStyles;
}

interface TimeColumnProps {
  label: string;
  values: number[];
  selected: number | null;
  idPrefix: string;
  isDisabled?: (value: number) => boolean;
  onSelect: (value: number) => void;
  listRef?: (node: HTMLUListElement | null) => void;
  className?: string;
  listClassName?: string;
  optionClassName?: string;
}

function TimeColumn({
  label,
  values,
  selected,
  idPrefix,
  isDisabled,
  onSelect,
  listRef,
  className,
  listClassName,
  optionClassName,
}: TimeColumnProps) {
  const localRef = useRef<HTMLUListElement | null>(null);
  const activeIndex = selected != null ? values.indexOf(selected) : -1;

  useEffect(() => {
    const node = localRef.current?.querySelector<HTMLElement>(`[data-value="${selected ?? ''}"]`);
    node?.scrollIntoView?.({ block: 'center' });
  }, [selected]);

  const findEnabled = (from: number, delta: number): number | null => {
    const count = values.length;
    if (count === 0) return null;
    let index = from;
    for (let step = 0; step < count; step += 1) {
      index = (index + delta + count) % count;
      const value = values[index];
      if (value != null && !isDisabled?.(value)) return value;
    }
    return null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const current = activeIndex >= 0 ? activeIndex : 0;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = findEnabled(current, event.key === 'ArrowDown' ? 1 : -1);
      if (next != null) onSelect(next);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const ordered = values
        .map((_value, index) => index)
        .filter((index) => {
          const value = values[index];
          return value != null && !isDisabled?.(value);
        });
      const target = event.key === 'Home' ? ordered[0] : ordered[ordered.length - 1];
      if (target != null) {
        const value = values[target];
        if (value != null) onSelect(value);
      }
      return;
    }
    if (/^\d$/.test(event.key)) {
      const match = values.find(
        (value) => !isDisabled?.(value) && String(value).padStart(2, '0').startsWith(event.key),
      );
      if (match != null) onSelect(match);
    }
  };

  return (
    <div data-slot="column" className={cx('yuki-time-picker__column', className)}>
      <span className="yuki-time-picker__column-title" aria-hidden="true">
        {label}
      </span>
      <ul
        ref={(node) => {
          localRef.current = node;
          listRef?.(node);
        }}
        role="listbox"
        aria-label={label}
        tabIndex={0}
        aria-activedescendant={selected != null ? `${idPrefix}-${selected}` : undefined}
        className={cx('yuki-time-picker__column-list', listClassName)}
        onKeyDown={onKeyDown}
      >
        {values.map((value) => {
          const disabled = Boolean(isDisabled?.(value));
          const isSelected = value === selected;
          return (
            <li
              key={value}
              id={`${idPrefix}-${value}`}
              role="option"
              data-value={value}
              data-slot="option"
              aria-selected={isSelected}
              aria-disabled={disabled || undefined}
              className={cx(
                'yuki-time-picker__option',
                isSelected && 'yuki-time-picker__option--selected',
                disabled && 'yuki-time-picker__option--disabled',
                optionClassName,
              )}
              onClick={() => {
                if (!disabled) onSelect(value);
              }}
            >
              {padTwo(value)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TimePickerInner(inputProps: TimePickerProps, forwardedRef: Ref<HTMLDivElement>) {
  const {
    control: props,
    frame,
    controlStyle,
    controlClassName,
  } = useStandaloneField(useComponentDefaults('TimePicker', inputProps));
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
    showSeconds = false,
    minuteStep = 1,
    secondStep = 1,
    min,
    max,
    format,
    showNow = true,
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
  const field = useFieldControl<string | null>({
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
  const { t } = useLocale();
  const baseId = useId();
  const triggerId = field.id ?? baseId + '-trigger';
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mergedRootRef = useMergedRefs(rootRef, forwardedRef);
  const columnRefs = useRef<Record<string, HTMLUListElement | null>>({});

  const interactive = !disabled && !readOnly && !rest.hidden && !frame.fieldProps?.hidden;
  const [requestedOpen, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = interactive && requestedOpen;
  const [value, setValue] = useControllableState<string | null>({
    value: field.bound ? (field.value ?? null) : valueProp,
    defaultValue,
    onChange: (next) => {
      onChange?.(next);
      field.onChange?.(next);
    },
  });

  const minParts = parseTime(min);
  const maxParts = parseTime(max);

  const currentParts: TimeParts = parseTime(value) ?? clampParts(getNowParts(), minParts, maxParts);

  const emit = useCallback(
    (parts: TimeParts) => {
      setValue(formatTime(clampParts(parts, minParts, maxParts), showSeconds));
    },
    [setValue, minParts, maxParts, showSeconds],
  );

  const close = useCallback(
    (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  const openPanel = useCallback(() => {
    if (!interactive) return;
    setOpen(true);
  }, [interactive, setOpen]);

  const clearValue = () => {
    if (!interactive) return;
    setValue(null);
    onClear?.();
    close(true);
  };

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      columnRefs.current.hours?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!interactive && requestedOpen) setOpen(false);
  }, [interactive, requestedOpen, setOpen]);

  useClickOutside([rootRef, panelRef], () => setOpen(false), open);
  useEscapeKey(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, open);

  const hourValues = getStepValues(0, 23);
  const minuteValues = getStepValues(0, 59, minuteStep);
  const secondValues = getStepValues(0, 59, secondStep);

  const isPartDisabled = (part: 'hours' | 'minutes' | 'seconds', candidate: number): boolean => {
    const next = { ...currentParts, [part]: candidate };
    if (minParts && compareParts(next, minParts) < 0) return true;
    if (maxParts && compareParts(next, maxParts) > 0) return true;
    return false;
  };

  const displayValue = value ? (format?.(value) ?? value) : null;

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

  const commitNow = () => {
    emit(getNowParts());
    close(true);
  };

  const columnNode = (
    part: 'hours' | 'minutes' | 'seconds',
    label: string,
    values: number[],
    selected: number,
  ) => (
    <TimeColumn
      label={label}
      values={values}
      selected={selected}
      idPrefix={`${baseId}-${part}`}
      isDisabled={(candidate) => isPartDisabled(part, candidate)}
      onSelect={(candidate) => emit({ ...currentParts, [part]: candidate })}
      listRef={(node) => {
        columnRefs.current[part] = node;
      }}
      className={classNames?.column}
      listClassName={classNames?.columnList}
      optionClassName={classNames?.option}
    />
  );

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
        data-slot="time-picker"
        data-size={size}
        data-open={open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-invalid={invalid || status === 'error' ? '' : undefined}
        data-status={status}
        data-value={value ?? undefined}
        className={cx('yuki-select-root', 'yuki-time-picker', className, classNames?.root)}
        style={{ ...style, ...styles?.root }}
      >
        {name != null && (
          <input
            type="hidden"
            name={name}
            value={value ?? ''}
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
            placeholder ?? t('timePicker.placeholder', { zh: '请选择时间', en: 'Select time' })
          }
          value={displayValue}
          hasValue={Boolean(value)}
          prefix={prefix ?? <Icon name="clock" size="1em" />}
          suffix={suffix}
          showArrow={showArrow}
          clearable={clearable && !readOnly}
          onClear={clearValue}
          clearLabel={t('common.clear', { zh: '清除', en: 'Clear' })}
          aria-haspopup="dialog"
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          className={cx('yuki-time-picker__trigger', classNames?.trigger, controlClassName)}
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
          aria-label={t('timePicker.dialog', { zh: '选择时间', en: 'Choose time' })}
        >
          <div
            ref={panelRef}
            data-slot="panel"
            className={cx('yuki-time-picker__panel', classNames?.panel)}
            style={styles?.panel}
          >
            <div
              data-slot="header"
              className={cx('yuki-time-picker__header', classNames?.header)}
              aria-live="polite"
            >
              {formatTime(currentParts, showSeconds)}
            </div>
            <div
              data-slot="columns"
              className={cx('yuki-time-picker__columns', classNames?.columns)}
              style={styles?.columns}
            >
              {columnNode(
                'hours',
                t('timePicker.hours', { zh: '时', en: 'Hour' }),
                hourValues,
                currentParts.hours,
              )}
              {columnNode(
                'minutes',
                t('timePicker.minutes', { zh: '分', en: 'Minute' }),
                minuteValues,
                currentParts.minutes,
              )}
              {showSeconds &&
                columnNode(
                  'seconds',
                  t('timePicker.seconds', { zh: '秒', en: 'Second' }),
                  secondValues,
                  currentParts.seconds,
                )}
            </div>
            {showNow && interactive && (
              <div
                data-slot="footer"
                className={cx('yuki-time-picker__footer', classNames?.footer)}
              >
                <button
                  type="button"
                  data-slot="now"
                  className={cx('yuki-time-picker__now', classNames?.now)}
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    commitNow();
                  }}
                >
                  {t('common.now', { zh: '此刻', en: 'Now' })}
                </button>
              </div>
            )}
          </div>
        </Popup>
      </div>
    </StandaloneField>
  );
}

/**
 * TimePicker with a three-column listbox panel. Values are plain
 * `HH:mm`/`HH:mm:ss` strings so they serialise well in forms.
 */
export const TimePicker = forwardRef(TimePickerInner) as (
  props: TimePickerProps & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

(TimePicker as { displayName?: string }).displayName = 'TimePicker';

export default TimePicker;
