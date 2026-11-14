import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useComponentSize, type Size } from '../../theme';
import { useFieldControl, type FieldStatus } from '../form/context';

export interface SliderMark {
  label: ReactNode;
}

export interface SliderClassNames {
  root?: string;
  input?: string;
  marks?: string;
  mark?: string;
  value?: string;
}

export interface SliderStyles {
  root?: StyleProperties;
  input?: StyleProperties;
  marks?: StyleProperties;
  mark?: StyleProperties;
  value?: StyleProperties;
}

export interface SliderProps
  extends Omit<
    WithStyle<InputHTMLAttributes<HTMLInputElement>>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'type'
  > {
  size?: Size;
  status?: FieldStatus;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Render tick labels under the track. */
  marks?: Record<number, ReactNode>;
  /** Show a floating value bubble above the thumb. */
  showValue?: boolean;
  formatValue?: (value: number) => string;
  /** Fill from the end instead of the start. */
  reverse?: boolean;
  onChange?: (value: number) => void;
  /** Fired once the interaction ends (pointer up / key up / blur). */
  onChangeComplete?: (value: number) => void;
  classNames?: SliderClassNames;
  styles?: SliderStyles;
}

function roundStep(value: number, min: number, step: number): number {
  if (step <= 0) return value;
  return Number((min + Math.round((value - min) / step) * step).toFixed(10));
}

/**
 * Single-value slider. Uses a native `input[type=range]` underneath for label
 * association and form semantics, with token-driven track / thumb styling and a
 * custom keyboard loop (Home / End / arrows / Page keys).
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(inputProps, ref) {
  const props = useComponentDefaults('Slider', inputProps);
  const {
    size: sizeProp,
    status: statusProp,
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    disabled,
    marks,
    showValue = false,
    formatValue,
    reverse = false,
    onChange,
    onChangeComplete,
    className,
    style,
    classNames,
    styles,
    id,
    onKeyDown,
    onKeyUp,
    onPointerUp,
    onBlur,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const field = useFieldControl<number>({
    value,
    id,
    disabled,
    status: statusProp,
  });

  const [current, setCurrent] = useControllableState<number>({
    value: field.bound ? (field.value ?? min) : value,
    defaultValue: defaultValue ?? min,
  });

  const clamp = (next: number) => Math.min(max, Math.max(min, roundStep(next, min, step)));
  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const fillPercent = Math.min(100, Math.max(0, reverse ? 100 - percent : percent));

  const commit = (next: number) => {
    const clamped = clamp(next);
    if (Object.is(clamped, current)) return;
    setCurrent(clamped);
    onChange?.(clamped);
    field.onChange?.(clamped);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || field.disabled) return;

    let next: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = current + (reverse ? -step : step);
        break;
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
        next = current + (reverse ? step : -step);
        break;
      case 'ArrowDown':
        next = current - step;
        break;
      case 'PageUp':
        next = current + step * 10;
        break;
      case 'PageDown':
        next = current - step * 10;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }

    event.preventDefault();
    commit(next);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyUp?.(event);
    if (event.defaultPrevented || field.disabled) return;
    if (event.key.startsWith('Arrow') || ['Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
      onChangeComplete?.(current);
    }
  };

  const styleWithFill = {
    '--yuki-slider-percent': `${Math.min(100, Math.max(0, percent))}%`,
    direction: reverse ? 'rtl' : undefined,
    ...styles?.input,
    ...style,
  } as StyleProperties;

  const formatted = formatValue ? formatValue(current) : String(current);

  return (
    <div
      data-slot="slider"
      data-size={size}
      data-status={field.status}
      data-disabled={field.disabled || undefined}
      data-reverse={reverse || undefined}
      className={cx('yuki-slider', `yuki-slider--${size}`, classNames?.root, className)}
      style={styles?.root}
    >
      {showValue && (
        <span
          data-slot="value"
          aria-hidden="true"
          className={cx('yuki-slider__value', classNames?.value)}
          style={
            {
              insetInlineStart: `${fillPercent}%`,
              ...styles?.value,
            } as StyleProperties
          }
        >
          {formatted}
        </span>
      )}
      <input
        {...rest}
        ref={ref}
        type="range"
        data-slot="control"
        className={cx('yuki-slider__input', classNames?.input)}
        style={styleWithFill}
        id={field.id}
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={field.disabled}
        aria-valuetext={formatValue ? formatted : undefined}
        aria-invalid={(field.status === 'error' || undefined) as boolean | undefined}
        {...field.ariaProps}
        onChange={(event) => commit(Number(event.target.value))}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          if (!event.defaultPrevented) onChangeComplete?.(Number(event.currentTarget.value));
        }}
        onBlur={(event) => {
          onBlur?.(event);
          field.onBlur?.();
          if (!event.defaultPrevented) onChangeComplete?.(current);
        }}
      />
      {marks && (
        <div
          data-slot="marks"
          className={cx('yuki-slider__marks', classNames?.marks)}
          style={styles?.marks}
          aria-hidden="true"
        >
          {Object.entries(marks).map(([markValue, label]) => {
            const numeric = Number(markValue);
            const markPercent =
              max === min ? 0 : ((numeric - min) / (max - min)) * 100;
            return (
              <span
                key={markValue}
                data-slot="mark"
                className={cx('yuki-slider__mark', classNames?.mark)}
                style={
                  {
                    insetInlineStart: `${Math.min(100, Math.max(0, reverse ? 100 - markPercent : markPercent))}%`,
                    ...styles?.mark,
                  } as StyleProperties
                }
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});

Slider.displayName = 'Slider';
