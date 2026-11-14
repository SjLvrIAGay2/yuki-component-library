import type { StyleProperties, WithStyle } from '../../styles/properties';
import { useConfig, useComponentDefaults } from '../../theme';
import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { useAnimation, type AnimationOptions } from '../../animation';
import { cx } from '../../internal/cx';
import { useComponentSize, useLocale, type Size } from '../../theme';

export type ProgressType = 'line' | 'circle';
export type ProgressStatus = 'normal' | 'success' | 'exception';
export type ProgressTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface ProgressClassNames {
  root?: string;
  track?: string;
  bar?: string;
  text?: string;
}

export interface ProgressStyles {
  root?: StyleProperties;
  track?: StyleProperties;
  bar?: StyleProperties;
  text?: StyleProperties;
}

export interface ProgressProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
  /** Completion percentage, clamped to 0–100. @default 0 */
  percent?: number;
  value?: number | null;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number | null, max: number) => ReactNode;
  fieldProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  controlClassName?: string;
  controlStyle?: StyleProperties;
  fillProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  labelProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  valueProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  animation?: AnimationOptions | false;
  /** Shape of the indicator. @default 'line' */
  type?: ProgressType;
  /** Preset state; `exception` overrides the tone with danger. @default 'normal' */
  status?: ProgressStatus;
  /** Progress colour when status is normal. @default 'primary' */
  tone?: ProgressTone;
  /** Show the percentage label. @default true */
  showInfo?: boolean;
  /** Custom label renderer. */
  format?: (percent: number) => ReactNode;
  /** Line thickness (px) or circle stroke width in viewBox units. */
  strokeWidth?: number;
  /** Circle diameter (px). */
  size?: number | Size;
  /** Continuous animation for unknown progress. */
  indeterminate?: boolean;
  /** Component size. */
  sizePreset?: Size;
  classNames?: ProgressClassNames;
  styles?: ProgressStyles;
}

const clampPercent = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(inputProps, ref) {
    const props = useComponentDefaults('Progress', inputProps);
    const {
      percent,
      value: rawValue,
      max = 100,
      label: heading,
      showValue,
      formatValue,
      fieldProps,
      controlClassName,
      controlStyle,
      fillProps,
      labelProps,
      valueProps,
      animation,
      type = 'line',
      status = 'normal',
      tone = 'primary',
      showInfo = showValue ?? true,
      format,
      strokeWidth,
      size,
      indeterminate = percent === undefined && rawValue === null,
      sizePreset,
      classNames,
      styles,
      className,
      style,
      role,
      ...rest
    } = props;
    const preset = useComponentSize(sizePreset ?? (typeof size === 'string' ? size : undefined));
    const headingId = useId();
    const { duration, delay, ...motion } = useAnimation(
      animation,
      indeterminate ? 'shimmer' : 'feedback',
    );
    const customMotion =
      useConfig().animation !== undefined || animation !== undefined ? motion : undefined;
    const { t } = useLocale();
    const maximum = percent !== undefined || !Number.isFinite(max) || max <= 0 ? 100 : max;
    const measured = percent ?? rawValue ?? 0;
    const amount = Number.isFinite(measured) ? Math.min(maximum, Math.max(0, measured)) : 0;
    const value = clampPercent((amount / maximum) * 100);
    const display = Math.round(value);
    const resolvedTone: ProgressTone =
      status === 'exception' ? 'danger' : status === 'success' ? 'success' : tone;
    const text = formatValue
      ? formatValue(indeterminate ? null : amount, maximum)
      : format
        ? format(value)
        : indeterminate && rawValue === null
          ? '…'
          : `${display}%`;
    const label = typeof text === 'string' || typeof text === 'number' ? String(text) : undefined;

    const valueNode = showInfo && (
      <span
        {...valueProps}
        className={cx('yuki-progress__text', classNames?.text, valueProps?.className)}
        style={{ ...styles?.text, ...valueProps?.style }}
        data-slot="text"
      >
        {text}
      </span>
    );
    const withLabel = (control: ReactNode) =>
      heading != null || fieldProps ? (
        <div
          {...fieldProps}
          hidden={rest.hidden || fieldProps?.hidden}
          className={cx('yuki-progress-field', fieldProps?.className)}
        >
          {heading != null && (
            <div {...labelProps} id={headingId}>
              {heading}
            </div>
          )}
          {control}
        </div>
      ) : (
        control
      );
    const accessible = {
      'aria-valuemin': 0,
      'aria-valuemax': maximum,
      'aria-valuenow': indeterminate
        ? undefined
        : rawValue !== undefined || max !== 100
          ? amount
          : display,
      'aria-valuetext': indeterminate ? undefined : label,
      'aria-busy': indeterminate || undefined,
      'aria-labelledby': rest['aria-labelledby'] ?? (heading != null ? headingId : undefined),
      'aria-label':
        rest['aria-label'] ??
        (heading == null ? t('progress.label', { zh: '进度', en: 'Progress' }) : undefined),
    };

    if (type === 'circle') {
      const radius = 46;
      const stroke = strokeWidth ?? 6;
      const circumference = 2 * Math.PI * radius;
      const offset = indeterminate ? circumference * 0.75 : circumference * (1 - value / 100);

      return withLabel(
        <div
          {...rest}
          ref={ref}
          role={role ?? 'progressbar'}
          {...accessible}
          className={cx(
            'yuki-progress',
            'yuki-progress--circle',
            `yuki-progress--${resolvedTone}`,
            indeterminate && 'yuki-progress--indeterminate',
            controlClassName,
            classNames?.root,
            className,
          )}
          style={{
            ...(typeof size === 'number' ? { width: size, height: size } : {}),
            ...style,
            ...styles?.root,
            ...controlStyle,
          }}
          data-slot="root"
          data-type="circle"
          data-status={status}
          data-tone={resolvedTone}
          data-size={preset}
        >
          <span
            className={cx('yuki-progress__circle', classNames?.track)}
            style={styles?.track}
            data-slot="circle"
          >
            <svg
              {...customMotion}
              className={cx('yuki-progress__svg', customMotion?.className)}
              viewBox="0 0 100 100"
              role="presentation"
              focusable="false"
              style={{
                ...customMotion?.style,
                ...(typeof size === 'number' ? { width: size, height: size } : {}),
              }}
            >
              <circle
                className="yuki-progress__circle-track"
                cx="50"
                cy="50"
                r={radius}
                strokeWidth={stroke}
                fill="none"
              />
              <circle
                className={cx('yuki-progress__circle-bar', classNames?.bar)}
                style={styles?.bar}
                cx="50"
                cy="50"
                r={radius}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                data-slot="bar"
              />
            </svg>
            {valueNode}
          </span>
        </div>,
      );
    }

    return withLabel(
      <div
        {...rest}
        ref={ref}
        role={role ?? 'progressbar'}
        {...accessible}
        className={cx(
          'yuki-progress',
          'yuki-progress--line',
          `yuki-progress--${resolvedTone}`,
          indeterminate && 'yuki-progress--indeterminate',
          controlClassName,
          classNames?.root,
          className,
        )}
        style={{ ...style, ...styles?.root, ...controlStyle }}
        data-slot="root"
        data-type="line"
        data-status={status}
        data-tone={resolvedTone}
        data-size={preset}
      >
        <div
          className={cx('yuki-progress__track', classNames?.track)}
          style={{ ...styles?.track, height: strokeWidth != null ? strokeWidth : undefined }}
          data-slot="track"
        >
          <div
            {...fillProps}
            {...customMotion}
            className={cx(
              'yuki-progress__bar',
              classNames?.bar,
              customMotion?.className,
              fillProps?.className,
            )}
            style={{
              ...customMotion?.style,
              ...styles?.bar,
              width: indeterminate ? '40%' : `${value}%`,
              ...fillProps?.style,
            }}
            data-slot="bar"
          />
        </div>
        {valueNode}
      </div>,
    );
  },
);

Progress.displayName = 'Progress';
