import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  StandaloneField,
  fieldDescription,
  useStandaloneField,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useMergedRefs } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { useFieldControl, type FieldStatus } from '../form/context';
import { Icon } from '../icon/Icon';

export interface InputNumberClassNames {
  root?: string;
  group?: string;
  prefix?: string;
  input?: string;
  suffix?: string;
  controls?: string;
  up?: string;
  down?: string;
}

export interface InputNumberStyles {
  root?: StyleProperties;
  group?: StyleProperties;
  prefix?: StyleProperties;
  input?: StyleProperties;
  suffix?: StyleProperties;
  controls?: StyleProperties;
  up?: StyleProperties;
  down?: StyleProperties;
}

export interface InputNumberStepInfo {
  type: 'up' | 'down';
}

export interface InputNumberProps
  extends
    StandaloneFieldProps,
    Omit<
      WithStyle<InputHTMLAttributes<HTMLInputElement>>,
      'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix' | 'min' | 'max' | 'step'
    > {
  size?: Size;
  status?: FieldStatus;
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  /** Fixed number of decimals; also rounds stepper results. */
  precision?: number;
  /** Show the up/down stepper column. */
  controls?: boolean;
  /** ArrowUp / ArrowDown step the value when the input is focused. */
  keyboard?: boolean;
  formatter?: (value: number | null) => string;
  parser?: (text: string) => number | null;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  wrapperProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  startIconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  endIconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  prefix?: ReactNode;
  suffix?: ReactNode;
  onChange?: (value: number | null) => void;
  onStep?: (value: number, info: InputNumberStepInfo) => void;
  classNames?: InputNumberClassNames;
  styles?: InputNumberStyles;
}

function parseNumber(text: string): number | null {
  const normalised = text.replace(/[\s,]/g, '');
  if (normalised === '' || normalised === '-' || normalised === '.') return null;
  const parsed = Number(normalised);
  return Number.isFinite(parsed) ? parsed : null;
}

function trimFloat(value: number): number {
  return Number(value.toFixed(10));
}

/**
 * Numeric input with clamped steppers. Keeps the in-progress text as a draft so
 * partial values like `1.` stay editable, and commits the clamped number on
 * blur.
 */
export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  function InputNumber(inputProps, ref) {
    const {
      control: props,
      frame,
      fallbackId,
      controlClassName,
      controlStyle,
    } = useStandaloneField(useComponentDefaults('InputNumber', inputProps));
    const {
      size: sizeProp,
      status: statusProp,
      value,
      defaultValue = null,
      min,
      max,
      step = 1,
      precision: requestedPrecision,
      controls = true,
      keyboard = true,
      formatter,
      parser,
      startIcon,
      endIcon,
      wrapperProps,
      startIconProps,
      endIconProps,
      prefix = startIcon,
      suffix = endIcon,
      onChange,
      onStep,
      className,
      style,
      classNames,
      styles,
      id,
      disabled,
      onBlur,
      onFocus,
      readOnly,
      onKeyDown,
      ...rest
    } = props;

    const precision =
      requestedPrecision !== undefined && Number.isFinite(requestedPrecision)
        ? Math.max(0, Math.min(100, Math.trunc(requestedPrecision)))
        : undefined;
    const size = useComponentSize(sizeProp);
    const { t } = useLocale();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = useMergedRefs(ref, inputRef);
    const focusedRef = useRef(false);

    const field = useFieldControl<number | null>({
      value,
      id,
      disabled,
      status: frame.invalid ? 'error' : statusProp,
    });
    const controlId = field.id ?? fallbackId;

    const [current, setCurrent] = useControllableState<number | null>({
      value: field.bound ? ((field.value as number | null | undefined) ?? null) : value,
      defaultValue,
    });

    const format = (next: number | null): string => {
      if (next === null) return '';
      if (formatter) return formatter(next);
      return precision === undefined ? String(next) : next.toFixed(precision);
    };

    const [draft, setDraft] = useState<string>(() => format(current));

    useEffect(() => {
      if (!focusedRef.current) setDraft(format(current));
      // Re-sync only when the committed value / precision changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, precision]);

    const clamp = (next: number): number => {
      let result = precision === undefined ? trimFloat(next) : Number(next.toFixed(precision));
      if (min !== undefined && result < min) result = min;
      if (max !== undefined && result > max) result = max;
      return precision === undefined ? trimFloat(result) : Number(result.toFixed(precision));
    };

    const emit = (next: number | null) => {
      setCurrent(next);
      onChange?.(next);
      field.onChange?.(next);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value;
      setDraft(text);
      emit(parser ? parser(text) : parseNumber(text));
    };

    const stepBy = (direction: 1 | -1) => {
      if (field.disabled || readOnly) return;
      const base = current ?? 0;
      const next = clamp(base + direction * step);
      emit(next);
      setDraft(format(next));
      onStep?.(next, { type: direction > 0 ? 'up' : 'down' });
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      focusedRef.current = false;
      const parsed = parser ? parser(draft) : parseNumber(draft);
      const next = parsed === null ? null : clamp(parsed);
      if (next !== current) emit(next);
      setDraft(format(next));
      onBlur?.(event);
      field.onBlur?.();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (!keyboard || readOnly || field.disabled || event.defaultPrevented) return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        stepBy(1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        stepBy(-1);
      }
    };

    const isDisabled = field.disabled;
    const status = field.status;

    return (
      <StandaloneField
        frame={frame}
        id={controlId}
        hidden={rest.hidden}
        required={rest.required || field.required}
      >
        <div
          data-slot="input-number"
          data-size={size}
          data-status={status}
          data-disabled={isDisabled || undefined}
          className={cx(
            'yuki-input-number',
            `yuki-input-number--${size}`,
            classNames?.root,
            className,
          )}
          style={{ ...styles?.root, ...style }}
        >
          <div
            {...wrapperProps}
            data-slot="group"
            className={cx('yuki-input-number__group', classNames?.group, wrapperProps?.className)}
            style={{ ...styles?.group, ...wrapperProps?.style }}
          >
            {prefix !== undefined && prefix !== null && (
              <span
                {...startIconProps}
                data-slot="prefix"
                className={cx(
                  'yuki-input-number__prefix',
                  classNames?.prefix,
                  startIconProps?.className,
                )}
                style={{ ...styles?.prefix, ...startIconProps?.style }}
              >
                {prefix}
              </span>
            )}
            <input
              {...rest}
              ref={mergedRef}
              data-slot="control"
              className={cx('yuki-input-number__input', classNames?.input, controlClassName)}
              style={{ ...styles?.input, ...controlStyle }}
              id={controlId}
              readOnly={readOnly}
              role="spinbutton"
              inputMode="decimal"
              autoComplete="off"
              value={draft}
              disabled={isDisabled}
              aria-valuenow={current ?? undefined}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuetext={current === null ? '' : format(current)}
              {...field.ariaProps}
              aria-invalid={
                frame.invalid ||
                status === 'error' ||
                field.ariaProps['aria-invalid'] ||
                rest['aria-invalid']
              }
              aria-describedby={fieldDescription(
                frame,
                controlId,
                rest['aria-describedby'],
                field.ariaProps['aria-describedby'],
              )}
              onChange={handleChange}
              onFocus={(event) => {
                focusedRef.current = true;
                onFocus?.(event);
              }}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
            {suffix !== undefined && suffix !== null && (
              <span
                {...endIconProps}
                data-slot="suffix"
                className={cx(
                  'yuki-input-number__suffix',
                  classNames?.suffix,
                  endIconProps?.className,
                )}
                style={{ ...styles?.suffix, ...endIconProps?.style }}
              >
                {suffix}
              </span>
            )}
            {controls && (
              <span
                data-slot="controls"
                className={cx('yuki-input-number__controls', classNames?.controls)}
                style={styles?.controls}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={t('inputNumber.increase', { zh: '增加', en: 'Increase' })}
                  data-slot="up"
                  className={cx('yuki-input-number__arrow', classNames?.up)}
                  style={styles?.up}
                  disabled={
                    isDisabled ||
                    readOnly ||
                    (max !== undefined && current !== null && current >= max)
                  }
                  onClick={() => stepBy(1)}
                >
                  <Icon name="chevron-up" />
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={t('inputNumber.decrease', { zh: '减少', en: 'Decrease' })}
                  data-slot="down"
                  className={cx('yuki-input-number__arrow', classNames?.down)}
                  style={styles?.down}
                  disabled={
                    isDisabled ||
                    readOnly ||
                    (min !== undefined && current !== null && current <= min)
                  }
                  onClick={() => stepBy(-1)}
                >
                  <Icon name="chevron-down" />
                </button>
              </span>
            )}
          </div>
        </div>
      </StandaloneField>
    );
  },
);

InputNumber.displayName = 'InputNumber';
