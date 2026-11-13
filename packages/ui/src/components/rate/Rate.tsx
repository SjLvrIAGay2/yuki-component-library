import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { useFieldControl } from '../form/context';
import { Icon } from '../icon/Icon';

export interface RateClassNames {
  root?: string;
  item?: string;
  star?: string;
  fill?: string;
}

export interface RateStyles {
  root?: CSSProperties;
  item?: CSSProperties;
  star?: CSSProperties;
  fill?: CSSProperties;
}

export interface RateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  /** Number of symbols, 5 by default. */
  count?: number;
  name?: string;
  allowHalf?: boolean;
  /** Clicking the current value again clears it to 0. */
  allowClear?: boolean;
  disabled?: boolean;
  size?: Size;
  /** Custom symbol; a function receives the 1-based index. */
  character?: ReactNode | ((index: number) => ReactNode);
  onChange?: (value: number) => void;
  onHoverChange?: (value: number) => void;
  classNames?: RateClassNames;
  styles?: RateStyles;
}

/**
 * Star rating. Implements the ARIA radio-group pattern: one tab stop, arrow keys
 * move and select, Home / End jump to the first / last value.
 */
export const Rate = forwardRef<HTMLDivElement, RateProps>(function Rate(inputProps, ref) {
  const props = useComponentDefaults('Rate', inputProps);
  const {
    value,
    defaultValue = 0,
    count = 5,
    name, style,
    allowHalf = false,
    allowClear = false,
    disabled = false,
    size: sizeProp,
    character,
    onChange,
    onHoverChange,
    className,
    classNames,
    styles,
    onMouseLeave,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const field = useFieldControl<number>({ value, disabled });
  const itemRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [current, setCurrent] = useControllableState<number>({
    value: field.bound ? (field.value ?? 0) : value,
    defaultValue,
  });
  const [hover, setHover] = useState<number | undefined>(undefined);
  const [focusIndex, setFocusIndex] = useState(() =>
    Math.min(count, Math.max(1, Math.ceil(current))),
  );

  const shown = hover ?? current;
  const label = t('rate.label', { zh: '评分', en: 'Rate' });
  const isDisabled = field.disabled || disabled;

  const commit = (next: number, toggle = false) => {
    const clamped = Math.min(count, Math.max(0, next));
    const final = toggle && allowClear && clamped === current ? 0 : clamped;
    setCurrent(final);
    onChange?.(final);
    field.onChange?.(final);
  };

  const focusItem = (index: number) => {
    const clamped = Math.min(count, Math.max(1, index));
    setFocusIndex(clamped);
    itemRefs.current[clamped - 1]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.defaultPrevented || isDisabled) return;

    const step = allowHalf ? 0.5 : 1;
    const focusedValue = Math.ceil(current) === focusIndex ? current : focusIndex;
    const select = (next: number) => {
      setHover(undefined);
      focusItem(Math.ceil(next));
      commit(next);
    };

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        select(Math.min(count, focusedValue + step));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        select(Math.max(step, focusedValue - step));
        break;
      case 'Home':
        event.preventDefault();
        select(step);
        break;
      case 'End':
        event.preventDefault();
        select(count);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        setHover(undefined);
        commit(focusedValue, true);
        break;
      default:
        break;
    }
  };

  const valueFromPointer = (index: number, event: MouseEvent<HTMLSpanElement>): number => {
    if (!allowHalf) return index;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && event.clientX < rect.left + rect.width / 2) {
      return index - 0.5;
    }
    return index;
  };

  const preview = (index: number, event: MouseEvent<HTMLSpanElement>) => {
    if (isDisabled) return;
    const next = valueFromPointer(index, event);
    if (next !== hover) {
      setHover(next);
      onHoverChange?.(next);
    }
  };

  return (
    <div
      {...rest}
      ref={ref}
      role="radiogroup"
      aria-label={rest['aria-label'] ?? label}
      data-slot="rate"
      data-size={size}
      data-disabled={isDisabled || undefined}
      data-value={current}
      data-half={allowHalf || undefined}
      className={cx('yuki-rate', `yuki-rate--${size}`, classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        if (hover !== undefined) {
          setHover(undefined);
          onHoverChange?.(current);
        }
      }}
    >
      {name && current > 0 && <input type="hidden" name={name} value={current} disabled={isDisabled} />}
      {Array.from({ length: count }, (_, offset) => {
        const index = offset + 1;
        const fill = shown >= index ? 1 : allowHalf && shown >= index - 0.5 ? 0.5 : 0;
        const symbol = typeof character === 'function' ? character(index) : character ?? <Icon name="star" />;
        return (
          <span
            key={index}
            ref={(node) => {
              itemRefs.current[offset] = node;
            }}
            role="radio"
            aria-checked={Math.ceil(current) === index}
            aria-label={`${label} ${Math.ceil(current) === index ? current : index}`}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : index === focusIndex ? 0 : -1}
            data-slot="item"
            data-checked={fill > 0 || undefined}
            data-half={fill === 0.5 || undefined}
            className={cx('yuki-rate__item', classNames?.item)}
            style={styles?.item}
            onClick={(event) => {
              if (isDisabled) return;
              setFocusIndex(index);
              commit(valueFromPointer(index, event), true);
            }}
            onMouseEnter={(event) => preview(index, event)}
            onMouseMove={(event) => preview(index, event)}
            onKeyDown={handleKeyDown}
          >
            <span
              data-slot="star"
              aria-hidden="true"
              className={cx('yuki-rate__star', classNames?.star)}
              style={styles?.star}
            >
              {symbol}
            </span>
            {fill > 0 && (
              <span
                data-slot="fill"
                aria-hidden="true"
                className={cx('yuki-rate__star', 'yuki-rate__fill', classNames?.fill)}
                style={styles?.fill}
              >
                {symbol}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
});

Rate.displayName = 'Rate';
