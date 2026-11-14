import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as Primitive from '@radix-ui/react-slider';
import { cx } from '../../internal/cx';
import { useLocale, useComponentSize, useComponentDefaults } from '../../theme';
import { useAnimation, type AnimationOptions } from '../../animation';
export interface RangeSliderProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Root>> {
  /** Controlled values are passed through; the caller must keep them within min/max and step. */
  value?: number[];
  /** Initial uncontrolled values. Defaults to the midpoint snapped to the configured step. */
  defaultValue?: number[];
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  thumbLabels?: string[];
  /** Attributes and styles for the field wrapper. className keeps targeting this wrapper. */
  fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  controlClassName?: string;
  controlStyle?: StyleProperties;
  size?: 'sm' | 'md' | 'lg';
  trackProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Track>>;
  rangeProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Range>>;
  thumbProps?:
    | Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Thumb>>, 'children' | 'asChild'>
    | ((
        index: number,
      ) => Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Thumb>>, 'children' | 'asChild'>);
  labelProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  valueProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  animation?: AnimationOptions | false;
}

function decimalPlaces(value: number) {
  const [coefficient = '', exponent = '0'] = String(value).split('e');
  return Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent));
}

function normalizeValues(values: number[], min: number, max: number, step: number) {
  const precision = Math.min(100, Math.max(decimalPlaces(min), decimalPlaces(step)));
  return values
    .map((value) => {
      const bounded = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
      const stepCount = (bounded - min) / step;
      const snapped =
        Math.round(stepCount + Number.EPSILON * Math.max(1, Math.abs(stepCount))) * step + min;
      const rounded = Number.isFinite(snapped) ? Number(snapped.toFixed(precision)) : bounded;
      return Math.min(max, Math.max(min, rounded));
    })
    .sort((a, b) => a - b);
}

function equalValues(left: number[], right: number[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export const RangeSlider = forwardRef<HTMLSpanElement, RangeSliderProps>(function RangeSlider(input, ref) {
  const {
    label,
    showValue,
    formatValue = String,
    thumbLabels,
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    className,
    fieldProps,
    controlClassName,
    controlStyle,
    size: sizeProp,
    trackProps,
    rangeProps,
    thumbProps,
    labelProps,
    valueProps,
    animation,
    ...props
  } = useComponentDefaults('RangeSlider', input);
  const size = useComponentSize(sizeProp);
  const { duration, delay, ...motion } = useAnimation(animation, 'feedback');
  const { messages } = useLocale();
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 100;
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const [internal, setInternal] = useState(() =>
    normalizeValues(defaultValue ?? [safeMin / 2 + safeMax / 2], safeMin, safeMax, safeStep),
  );
  const values = value ?? normalizeValues(internal, safeMin, safeMax, safeStep);

  useEffect(() => {
    if (value !== undefined) return;
    const normalized = normalizeValues(internal, safeMin, safeMax, safeStep);
    if (!equalValues(internal, normalized)) {
      setInternal(normalized);
      onValueChange?.(normalized);
    }
  }, [internal, value, safeMin, safeMax, safeStep, onValueChange]);

  return (
    <div
      {...fieldProps}
      className={cx('yuki-slider', `yuki-slider--${size}`, className, fieldProps?.className)}
      hidden={props.hidden || fieldProps?.hidden}
    >
      {(label || showValue) && (
        <div {...labelProps} className={cx('yuki-range-slider__label', labelProps?.className)}>
          <span>{label}</span>
          {showValue && <span {...valueProps}>{values.map(formatValue).join(' – ')}</span>}
        </div>
      )}
      <Primitive.Root
        {...props}
        ref={ref}
        className={cx('yuki-range-slider', controlClassName)}
        style={{ ...props.style, ...controlStyle }}
        min={safeMin}
        max={safeMax}
        step={safeStep}
        value={values}
        onValueChange={(next) => {
          const normalized =
            value === undefined ? normalizeValues(next, safeMin, safeMax, safeStep) : next;
          setInternal(normalized);
          onValueChange?.(normalized);
        }}
      >
        <Primitive.Track {...trackProps} className={cx('yuki-range-slider__track', trackProps?.className)}>
          <Primitive.Range
            {...rangeProps}
            className={cx('yuki-range-slider__range', rangeProps?.className)}
          />
        </Primitive.Track>
        {values.map((_, i) => {
          const custom = typeof thumbProps === 'function' ? thumbProps(i) : thumbProps;
          return (
            <Primitive.Thumb
              {...custom}
              {...motion}
              key={i}
              className={cx('yuki-range-slider__thumb', motion.className, custom?.className)}
              style={{ ...motion.style, ...custom?.style }}
              aria-label={
                thumbLabels?.[i] ??
                custom?.['aria-label'] ??
                `${(typeof label === 'string' ? label : undefined) ?? props['aria-label'] ?? messages.sliderValue}${values.length > 1 ? ` ${i + 1}` : ''}`
              }
            />
          );
        })}
      </Primitive.Root>
    </div>
  );
});
