import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { useControllableState } from '../../hooks';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export type StepsDirection = 'horizontal' | 'vertical';

export interface StepItem {
  key?: string | number;
  title?: ReactNode;
  description?: ReactNode;
  /** Small hint rendered next to the title. */
  subTitle?: ReactNode;
  /** Custom icon instead of the generated number / status glyph. */
  icon?: ReactNode;
  status?: StepStatus;
  disabled?: boolean;
}

export interface StepsClassNames {
  root?: string;
  item?: string;
  icon?: string;
  tail?: string;
  content?: string;
  title?: string;
  description?: string;
  dot?: string;
}

export interface StepsStyles {
  root?: StyleProperties;
  item?: StyleProperties;
  icon?: StyleProperties;
  tail?: StyleProperties;
  content?: StyleProperties;
  title?: StyleProperties;
  description?: StyleProperties;
  dot?: StyleProperties;
}

export interface StepsProps extends Omit<WithStyle<HTMLAttributes<HTMLOListElement>>, 'onChange'> {
  items: StepItem[];
  /** Index of the current step, controlled. */
  current?: number;
  /** Initial index of the current step, uncontrolled. */
  defaultCurrent?: number;
  /** Fires when a clickable step is chosen. */
  onChange?: (index: number) => void;
  direction?: StepsDirection;
  /** Status of the current step (`process` by default). */
  status?: StepStatus;
  size?: Size;
  /** Renders steps as buttons that can be chosen. */
  clickable?: boolean;
  /** Replaces the numbered circles with dots. */
  progressDot?: boolean;
  classNames?: StepsClassNames;
  styles?: StepsStyles;
}

function statusOf(
  item: StepItem,
  index: number,
  current: number,
  currentStatus: StepStatus,
): StepStatus {
  if (item.status) return item.status;
  if (index < current) return 'finish';
  if (index === current) return currentStatus;
  return 'wait';
}

const isEnabled = (item: StepItem): boolean => !item.disabled;

/**
 * Ordered process trail. Steps below the current one finish automatically;
 * passing `clickable` turns them into buttons with arrow-key navigation.
 */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  inputProps,
  ref,
) {
  const {
    items,
    current,
    defaultCurrent = 0,
    onChange,
    direction = 'horizontal',
    status = 'process',
    size: sizeProp,
    clickable = false,
    progressDot = false,
    classNames,
    styles,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  } = useComponentDefaults('Steps', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useControllableState<number>({
    value: current,
    defaultValue: defaultCurrent,
    onChange,
  });

  const enabledIndexes = items.reduce<number[]>((acc, item, index) => {
    if (isEnabled(item)) acc.push(index);
    return acc;
  }, []);

  const focusAt = (index: number) => {
    itemRefs.current[index]?.focus();
  };

  const moveFocus = (index: number, delta: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const position = enabledIndexes.indexOf(index);
    const nextPosition =
      position === -1
        ? 0
        : (position + delta + enabledIndexes.length) % enabledIndexes.length;
    focusAt(enabledIndexes[nextPosition] as number);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    if (!clickable) return;
    const target = event.target as HTMLElement;
    const index = itemRefs.current.findIndex((node) => node === target);
    if (index === -1) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(index, -1);
        break;
      case 'Home':
        event.preventDefault();
        if (enabledIndexes.length > 0) focusAt(enabledIndexes[0] as number);
        break;
      case 'End':
        event.preventDefault();
        if (enabledIndexes.length > 0) focusAt(enabledIndexes[enabledIndexes.length - 1] as number);
        break;
      default:
        break;
    }
  };

  return (
    <ol
      {...rest}
      ref={ref}
      className={cx('yuki-steps', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-slot="steps"
      data-direction={direction}
      data-size={size}
      data-progress-dot={progressDot ? '' : undefined}
      aria-label={ariaLabel ?? t('steps.label', { 'zh-CN': '步骤条', 'en-US': 'Steps' })}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const itemStatus = statusOf(item, index, active, status);
        const isActive = index === active;
        const title = item.title ?? index + 1;
        const tail = index < items.length - 1 ? (
          <span
            className={cx('yuki-steps__tail', classNames?.tail)}
            style={styles?.tail}
            data-slot="tail"
            aria-hidden="true"
          />
        ) : null;
        const content = (
          <>
            <span
              className={cx('yuki-steps__icon', classNames?.icon)}
              style={styles?.icon}
              data-slot="icon"
              data-progress-dot={progressDot ? '' : undefined}
            >
              {item.icon ? (
                <span className="yuki-steps__custom-icon" aria-hidden="true">
                  {item.icon}
                </span>
              ) : progressDot ? (
                <span className={cx('yuki-steps__dot', classNames?.dot)} style={styles?.dot} data-slot="dot" />
              ) : itemStatus === 'finish' ? (
                <Icon name="check" aria-hidden="true" />
              ) : itemStatus === 'error' ? (
                <Icon name="x" aria-hidden="true" />
              ) : (
                <span className="yuki-steps__number">{index + 1}</span>
              )}
            </span>
            <span
              className={cx('yuki-steps__content', classNames?.content)}
              style={styles?.content}
              data-slot="content"
            >
              <span
                className={cx('yuki-steps__title', classNames?.title)}
                style={styles?.title}
                data-slot="title"
              >
                {title}
                {item.subTitle ? (
                  <span className="yuki-steps__subtitle">{item.subTitle}</span>
                ) : null}
                {direction === 'horizontal' && tail}
              </span>
              {item.description ? (
                <span
                  className={cx('yuki-steps__description', classNames?.description)}
                  style={styles?.description}
                  data-slot="description"
                >
                  {item.description}
                </span>
              ) : null}
            </span>
          </>
        );

        return (
          <li
            key={item.key ?? index}
            className={cx(
              'yuki-steps__item',
              classNames?.item,
              isActive && 'yuki-steps__item--active',
              itemStatus === 'finish' && 'yuki-steps__item--finish',
              itemStatus === 'error' && 'yuki-steps__item--error',
              itemStatus === 'wait' && 'yuki-steps__item--wait',
              itemStatus === 'process' && 'yuki-steps__item--process',
              item.disabled && 'yuki-steps__item--disabled',
            )}
            style={styles?.item}
            data-slot="item"
            data-status={itemStatus}
            data-active={isActive ? '' : undefined}
            data-disabled={item.disabled ? '' : undefined}
            aria-current={isActive ? 'step' : undefined}
          >
            {clickable && !item.disabled ? (
              <button
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                className="yuki-steps__button yuki-focus-ring"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(index)}
                data-slot="button"
              >
                {content}
              </button>
            ) : (
              <span
                className="yuki-steps__button"
                data-slot="button"
                aria-disabled={item.disabled ? true : undefined}
              >
                {content}
              </span>
            )}
            {direction === 'vertical' && tail}
          </li>
        );
      })}
    </ol>
  );
});

Steps.displayName = 'Steps';
