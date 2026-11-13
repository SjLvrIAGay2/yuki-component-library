import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import type { Size } from '../../theme';
import type { SelectStatus } from './select-utils';

/**
 * Shared trigger shell for the form-selection family (Select,
 * Cascader, TreeSelect, DatePicker, TimePicker, DateRangePicker). Every
 * consumer sizes, themes and lays out its trigger through the same
 * `.yuki-select-*` class contract, so these components stay visually
 * interchangeable. The surrounding root element is owned by the component and
 * must carry `.yuki-select-root` + `data-size`.
 */

export interface SelectTriggerClassNames {
  root?: string;
  prefix?: string;
  value?: string;
  placeholder?: string;
  suffix?: string;
  clear?: string;
  arrow?: string;
  tag?: string;
  tagLabel?: string;
  tagRemove?: string;
}

export interface SelectTriggerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'prefix' | 'onClick'> {
  size?: Size;
  open: boolean;
  disabled?: boolean;
  invalid?: boolean;
  status?: SelectStatus;
  borderless?: boolean;
  placeholder?: ReactNode;
  value?: ReactNode;
  valueProps?: HTMLAttributes<HTMLSpanElement>;
  arrowIcon?: ReactNode;
  /** Controls placeholder vs value styling. */
  hasValue: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showArrow?: boolean;
  clearable?: boolean;
  onClear?: (event: MouseEvent<HTMLSpanElement>) => void;
  clearLabel?: string;
  multiple?: boolean;
  /** Custom content instead of `value` (multiple Select tags, custom render). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: SelectTriggerClassNames;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

export const SelectTrigger = forwardRef<HTMLDivElement, SelectTriggerProps>(
  function SelectTrigger(
    {
      size = 'md',
      open,
      disabled = false,
      invalid = false,
      status,
      borderless = false,
      placeholder,
      value,
      valueProps,
      arrowIcon,
      hasValue,
      prefix,
      suffix,
      showArrow = true,
      clearable = false,
      onClear,
      clearLabel,
      multiple = false,
      children,
      className,
      style,
      classNames,
      onClick,
      role = 'combobox',
      tabIndex,
      ...rest
    },
    ref,
  ) {
    const showClear = clearable && hasValue && !disabled && Boolean(onClear);

    return (
      <div
        {...rest}
        ref={ref}
        data-slot="trigger"
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        data-size={size}
        data-invalid={invalid || status === 'error' ? '' : undefined}
        data-status={status}
        data-multiple={multiple ? '' : undefined}
        role={role}
        tabIndex={disabled ? -1 : (tabIndex ?? 0)}
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        className={cx(
          'yuki-select-trigger',
          borderless && 'yuki-select-trigger--borderless',
          multiple && 'yuki-select-trigger--multiple',
          status && `yuki-select-trigger--${status}`,
          disabled && 'yuki-select-trigger--disabled',
          className,
          classNames?.root,
        )}
        style={style}
        onClick={disabled ? undefined : onClick}
      >
        {prefix != null && (
          <span
            data-slot="prefix"
            className={cx('yuki-select-trigger__prefix', classNames?.prefix)}
          >
            {prefix}
          </span>
        )}
        {children ?? (
          <span
            {...valueProps}
            data-slot="value"
            className={cx(
              'yuki-select-trigger__value',
              !hasValue && 'yuki-select-trigger__value--placeholder',
              classNames?.value,
              valueProps?.className,
              !hasValue && classNames?.placeholder,
            )}
          >
            {hasValue ? value : placeholder}
          </span>
        )}
        {suffix != null && (
          <span
            data-slot="suffix"
            className={cx('yuki-select-trigger__suffix', classNames?.suffix)}
          >
            {suffix}
          </span>
        )}
        {showClear && (
          <span
            data-slot="clear"
            role="button"
            aria-label={clearLabel}
            tabIndex={-1}
            className={cx('yuki-select-trigger__clear', classNames?.clear)}
            onClick={(event) => {
              event.stopPropagation();
              onClear?.(event);
            }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Icon name="x" size="1em" />
          </span>
        )}
        {showArrow && (
          <span
            data-slot="arrow"
            aria-hidden="true"
            className={cx('yuki-select-trigger__arrow', classNames?.arrow)}
          >
            {arrowIcon === undefined ? <Icon name="chevron-down" size="1em" /> : arrowIcon}
          </span>
        )}
      </div>
    );
  },
);

SelectTrigger.displayName = 'SelectTrigger';

export interface SelectTagProps {
  label: ReactNode;
  /** Accessible name for the remove button, e.g. `移除 选项名`. */
  removeLabel: string;
  /** Omit to render a non-dismissible tag. */
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  classNames?: Pick<SelectTriggerClassNames, 'tag' | 'tagLabel' | 'tagRemove'>;
}

/** Chip used by multi-value triggers (Select, TreeSelect). */
export function SelectTag({
  label,
  removeLabel,
  onRemove,
  disabled = false,
  className,
  classNames,
}: SelectTagProps) {
  return (
    <span
      data-slot="tag"
      className={cx('yuki-select-tag', className, classNames?.tag)}
    >
      <span className={cx('yuki-select-tag__label', classNames?.tagLabel)}>{label}</span>
      {!disabled && onRemove && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={removeLabel}
          className={cx('yuki-select-tag__remove', classNames?.tagRemove)}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <Icon name="x" size="1em" />
        </button>
      )}
    </span>
  );
}

export interface SelectPanelStatusProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'error';
}

/** Empty / loading / error row shared by every selection panel. */
export function SelectPanelStatus({
  tone = 'default',
  className,
  children,
  ...rest
}: SelectPanelStatusProps) {
  return (
    <div
      {...rest}
      data-slot="status"
      className={cx('yuki-select-status', className)}
      data-tone={tone}
      role="presentation"
    >
      {children}
    </div>
  );
}

export function getListboxId(baseId: string): string {
  return `${baseId}-listbox`;
}

export function getOptionId(baseId: string, index: number): string {
  return `${baseId}-option-${index}`;
}
