import {
  StandaloneField,
  fieldDescription,
  useStandaloneField,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import {
  forwardRef,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useMergedRefs } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { useFieldControl, type FieldStatus } from '../form/context';

export interface InputClassNames {
  root?: string;
  /** The bordered box that wraps prefix / input / suffix. */
  group?: string;
  prefix?: string;
  /** The native `<input>`. */
  input?: string;
  suffix?: string;
  clear?: string;
  addonBefore?: string;
  addonAfter?: string;
  count?: string;
}

export interface InputStyles {
  root?: CSSProperties;
  group?: CSSProperties;
  prefix?: CSSProperties;
  input?: CSSProperties;
  suffix?: CSSProperties;
  clear?: CSSProperties;
  addonBefore?: CSSProperties;
  addonAfter?: CSSProperties;
  count?: CSSProperties;
}

export interface InputProps
  extends
    StandaloneFieldProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'size' | 'prefix' | 'onChange' | 'value' | 'defaultValue'
    > {
  /** Defaults to the ConfigProvider size, then `md`. */
  size?: Size;
  /** Validation look; `Form.Item` injects this automatically. */
  status?: FieldStatus;
  /** Leading decoration inside the field box. */
  prefix?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  startIconProps?: HTMLAttributes<HTMLSpanElement>;
  endIconProps?: HTMLAttributes<HTMLSpanElement>;
  /** Trailing decoration inside the field box. */
  suffix?: ReactNode;
  /** Text / node attached before the field box. */
  addonBefore?: ReactNode;
  /** Text / node attached after the field box. */
  addonAfter?: ReactNode;
  /** `false` removes the border and background (toolbar inputs). */
  bordered?: boolean;
  /** Show a clear button while the field has content. */
  allowClear?: boolean;
  /** Called after the value is cleared. */
  onClear?: () => void;
  /** Show a `length / maxLength` counter after the field. */
  showCount?: boolean;
  value?: string;
  defaultValue?: string;
  /** Called with the next string value, not the DOM event. */
  onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  classNames?: InputClassNames;
  styles?: InputStyles;
}

/**
 * Single-line text field.
 *
 * The root is a layout box (`data-slot="input"`); the native control is
 * `data-slot="control"` and receives the `ref` plus all unconsumed input
 * attributes (`name`, `placeholder`, `aria-*`, …). Bind it to a form with
 * `<Form.Item name="…"><Input /></Form.Item>`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(inputProps, ref) {
  const defaults = useComponentDefaults('Input', inputProps);
  const {
    control: props,
    frame,
    fallbackId,
    controlClassName,
    controlStyle,
  } = useStandaloneField(defaults);
  const {
    size: sizeProp,
    status: statusProp,
    startIcon,
    endIcon,
    wrapperProps,
    startIconProps,
    endIconProps,
    prefix = startIcon,
    suffix = endIcon,
    addonBefore,
    addonAfter,
    bordered = true,
    allowClear = false,
    onClear,
    showCount = false,
    classNames,
    styles,
    className,
    style,
    value,
    defaultValue,
    onChange,
    onBlur,
    id,
    disabled,
    maxLength,
    readOnly,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, inputRef);

  const field = useFieldControl<string>({
    value,
    id,
    disabled,
    status: frame.invalid ? 'error' : statusProp,
  });

  const controlId = field.id ?? fallbackId;
  const [current, setCurrent] = useControllableState<string>({
    value: field.bound ? ((field.value as string | undefined) ?? '') : value,
    defaultValue: defaultValue ?? '',
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setCurrent(next);
    onChange?.(next, event);
    field.onChange?.(next);
  };

  const handleClear = () => {
    setCurrent('');
    onChange?.('');
    field.onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  const canClear = allowClear && !field.disabled && !readOnly && current.length > 0;
  const hasAddonBefore = addonBefore !== undefined && addonBefore !== null;
  const hasAddonAfter = addonAfter !== undefined && addonAfter !== null;
  const count = [...current].length;

  return (
    <StandaloneField
      frame={frame}
      id={controlId}
      hidden={rest.hidden}
      required={rest.required || field.required}
    >
      <div
        data-slot="input"
        data-size={size}
        data-status={field.status}
        data-disabled={field.disabled || undefined}
        data-bordered={bordered ? undefined : 'false'}
        data-readonly={readOnly || undefined}
        data-has-addon-before={hasAddonBefore || undefined}
        data-has-addon-after={hasAddonAfter || undefined}
        className={cx(
          'yuki-input',
          `yuki-input--${size}`,
          !bordered && 'yuki-input--borderless',
          classNames?.root,
          className,
        )}
        style={{ ...styles?.root, ...style }}
      >
        {hasAddonBefore && (
          <span
            data-slot="addon-before"
            className={cx(
              'yuki-input__addon',
              'yuki-input__addon--before',
              classNames?.addonBefore,
            )}
            style={styles?.addonBefore}
          >
            {addonBefore}
          </span>
        )}
        <div
          {...wrapperProps}
          data-slot="group"
          className={cx('yuki-input__group', classNames?.group, wrapperProps?.className)}
          style={{ ...styles?.group, ...wrapperProps?.style }}
        >
          {prefix !== undefined && prefix !== null && (
            <span
              {...startIconProps}
              data-slot="prefix"
              className={cx('yuki-input__prefix', classNames?.prefix, startIconProps?.className)}
              style={{ ...styles?.prefix, ...startIconProps?.style }}
            >
              {prefix}
            </span>
          )}
          <input
            {...rest}
            ref={mergedRef}
            id={controlId}
            type={rest.type ?? 'text'}
            data-slot="control"
            className={cx('yuki-input__control', classNames?.input, controlClassName)}
            style={{ ...styles?.input, ...controlStyle }}
            value={current}
            onChange={handleChange}
            onBlur={(event) => {
              field.onBlur?.();
              onBlur?.(event);
            }}
            disabled={field.disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            {...field.ariaProps}
            aria-invalid={
              frame.invalid ||
              field.status === 'error' ||
              field.ariaProps['aria-invalid'] ||
              rest['aria-invalid']
            }
            aria-describedby={fieldDescription(
              frame,
              controlId,
              rest['aria-describedby'],
              field.ariaProps['aria-describedby'],
            )}
          />
          {canClear && (
            <button
              data-slot="clear"
              type="button"
              tabIndex={-1}
              aria-label={t('common.clear', { zh: '清除', en: 'Clear' })}
              className={cx('yuki-input__clear', classNames?.clear)}
              style={styles?.clear}
              onClick={handleClear}
            >
              <Icon name="x" />
            </button>
          )}
          {suffix !== undefined && suffix !== null && (
            <span
              {...endIconProps}
              data-slot="suffix"
              className={cx('yuki-input__suffix', classNames?.suffix, endIconProps?.className)}
              style={{ ...styles?.suffix, ...endIconProps?.style }}
            >
              {suffix}
            </span>
          )}
        </div>
        {hasAddonAfter && (
          <span
            data-slot="addon-after"
            className={cx('yuki-input__addon', 'yuki-input__addon--after', classNames?.addonAfter)}
            style={styles?.addonAfter}
          >
            {addonAfter}
          </span>
        )}
        {showCount && (
          <span
            data-slot="count"
            className={cx('yuki-input__count', classNames?.count)}
            style={styles?.count}
          >
            {maxLength ? `${count} / ${maxLength}` : count}
          </span>
        )}
      </div>
    </StandaloneField>
  );
});

Input.displayName = 'Input';
