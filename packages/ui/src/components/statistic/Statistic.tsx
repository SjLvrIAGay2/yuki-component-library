import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { usePrefersReducedMotion } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

export type StatisticValue = number | string;

export interface StatisticClassNames {
  root?: string;
  title?: string;
  content?: string;
  prefix?: string;
  value?: string;
  suffix?: string;
  loading?: string;
}

export interface StatisticStyles {
  root?: CSSProperties;
  title?: CSSProperties;
  content?: CSSProperties;
  prefix?: CSSProperties;
  value?: CSSProperties;
  suffix?: CSSProperties;
  loading?: CSSProperties;
}

export interface StatisticProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  /** 数值。 */
  value: StatisticValue;
  /** 标题。 */
  title?: ReactNode;
  label?: ReactNode;
  /** 前缀，例如货币符号。 */
  prefix?: ReactNode;
  /** 后缀，例如单位。 */
  suffix?: ReactNode;
  /** 小数位数。 */
  precision?: number;
  /** 千分位分隔符，传入后使用手动分组格式化。 */
  groupSeparator?: string;
  /** 小数点符号。 */
  decimalSeparator?: string;
  /** 完全自定义格式化函数。 */
  formatter?: (value: StatisticValue) => ReactNode;
  /** 在格式化结果基础上自定义渲染。 */
  valueRender?: (formatted: ReactNode, value: StatisticValue) => ReactNode;
  /** 是否启用数字滚动动画。 */
  countUp?: boolean;
  /** 滚动动画时长（毫秒）。 */
  countDuration?: number;
  /** 是否展示加载态。 */
  loading?: boolean;
  /** 尺寸。 */
  size?: Size;
  /** 数值的额外样式。 */
  valueStyle?: CSSProperties;
  classNames?: StatisticClassNames;
  styles?: StatisticStyles;
}

function groupDigits(
  value: number,
  precision: number,
  groupSeparator: string,
  decimalSeparator: string,
): string {
  const fixed = Math.abs(value).toFixed(Math.max(0, precision));
  const [integerPart, fraction] = fixed.split('.');
  const integer = integerPart ?? '0';
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  return `${value < 0 ? '-' : ''}${grouped}${
    fraction ? decimalSeparator + fraction : ''
  }`;
}

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(
  function Statistic(
    inputProps,
    ref,
  ) {
    const {
      value,
      label, title = label,
      prefix,
      suffix,
      precision,
      groupSeparator,
      decimalSeparator,
      formatter,
      valueRender,
      countUp = false,
      countDuration = 900,
      loading = false,
      size: sizeProp,
      valueStyle,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = useComponentDefaults('Statistic', inputProps);
    const size = useComponentSize(sizeProp);
    const { locale, t } = useLocale();
    const reducedMotion = usePrefersReducedMotion();
    const numericValue = typeof value === 'number' ? value : undefined;

    const [displayValue, setDisplayValue] = useState<number>(() =>
      numericValue !== undefined && countUp && !reducedMotion
        ? 0
        : (numericValue ?? 0),
    );
    const previousRef = useRef<number>(numericValue ?? 0);

    useEffect(() => {
      if (numericValue === undefined) return;
      if (!countUp || reducedMotion || !Number.isFinite(countDuration) || countDuration <= 0) {
        previousRef.current = numericValue;
        setDisplayValue(numericValue);
        return;
      }
      const from = previousRef.current;
      const to = numericValue;
      previousRef.current = to;
      if (from === to) {
        setDisplayValue(to);
        return;
      }
      let frame = 0;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / countDuration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(from + (to - from) * eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [numericValue, countUp, reducedMotion, countDuration]);

    const current =
      numericValue !== undefined && countUp ? displayValue : numericValue;

    const format = (input: StatisticValue): string => {
      if (typeof input !== 'number') return String(input);
      const fractionDigits = Math.max(0, Math.min(20, Math.floor(precision ?? 0) || 0));
      if (groupSeparator !== undefined || decimalSeparator !== undefined) {
        return groupDigits(
          input,
          fractionDigits,
          groupSeparator ?? ',',
          decimalSeparator ?? '.',
        );
      }
      if (precision === undefined) {
        return new Intl.NumberFormat(locale.name).format(input);
      }
      return new Intl.NumberFormat(locale.name, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(input);
    };

    const shownValue: StatisticValue =
      current !== undefined ? current : value;
    const formatted = formatter ? formatter(shownValue) : format(shownValue);
    const valueContent = valueRender
      ? valueRender(formatted, shownValue)
      : formatted;

    return (
      <div
        ref={ref}
        {...rest}
        data-slot="statistic"
        data-size={size}
        data-loading={loading || undefined}
        aria-busy={loading || undefined}
        className={cx(
          'yuki-statistic',
          `yuki-statistic--${size}`,
          classNames?.root,
          className,
        )}
        style={{ ...styles?.root, ...style }}
      >
        {title !== undefined && title !== null ? (
          <div
            data-slot="title"
            className={cx('yuki-statistic__title', classNames?.title)}
            style={styles?.title}
          >
            {title}
          </div>
        ) : null}

        <div
          data-slot="content"
          className={cx('yuki-statistic__content', classNames?.content)}
          style={styles?.content}
        >
          {prefix !== undefined && prefix !== null ? (
            <span
              data-slot="prefix"
              className={cx('yuki-statistic__prefix', classNames?.prefix)}
              style={styles?.prefix}
            >
              {prefix}
            </span>
          ) : null}

          {loading ? (
            <span
              data-slot="loading"
              className={cx('yuki-statistic__loading', classNames?.loading)}
              style={styles?.loading}
              aria-label={t('common.loading', {
                'zh-CN': '加载中',
                en: 'Loading',
              })}
            />
          ) : (
            <span
              data-slot="value"
              className={cx('yuki-statistic__value', classNames?.value)}
              style={{ ...styles?.value, ...valueStyle }}
            >
              {valueContent}
            </span>
          )}

          {suffix !== undefined && suffix !== null ? (
            <span
              data-slot="suffix"
              className={cx('yuki-statistic__suffix', classNames?.suffix)}
              style={styles?.suffix}
            >
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);

Statistic.displayName = 'Statistic';
