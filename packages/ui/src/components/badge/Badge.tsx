import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

export type BadgeStatus =
  | 'default'
  | 'processing'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeClassNames {
  root?: string;
  indicator?: string;
  count?: string;
  dot?: string;
  text?: string;
}

export interface BadgeStyles {
  root?: CSSProperties;
  indicator?: CSSProperties;
  count?: CSSProperties;
  dot?: CSSProperties;
  text?: CSSProperties;
}

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** 展示的数字。 */
  count?: number;
  /** 展示为小圆点（不展示数字）。 */
  dot?: boolean;
  dotProps?: HTMLAttributes<HTMLSpanElement>;
  /** 状态徽标，也可单独搭配 `text` 使用。 */
  status?: BadgeStatus;
  /** 状态文本，仅在无 children 时生效。 */
  text?: ReactNode;
  /** 数字上限，超出显示 `${max}+`。 */
  max?: number;
  /** 数字为 0 时是否仍展示。 */
  showZero?: boolean;
  /** 自定义徽标颜色（背景色）。 */
  color?: string;
  /** 徽标相对右上角的偏移量 `[x, y]`。 */
  offset?: [number, number];
  /** 尺寸。 */
  size?: Size;
  classNames?: BadgeClassNames;
  styles?: BadgeStyles;
}

type BadgeMode = 'overlay' | 'status' | 'pill' | 'none';

const STATUSES: readonly BadgeStatus[] = [
  'default',
  'processing',
  'success',
  'warning',
  'danger',
  'info',
];

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  inputProps,
  ref,
) {
  const {
    count,
    dot,
    dotProps,
    status,
    text,
    max,
    showZero = false,
    color,
    offset,
    size: sizeProp,
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = useComponentDefaults('Badge', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();

  const hasChildren = children !== undefined && children !== null;
  const showCount = count !== undefined && (count > 0 || showZero);
  const hasStatusText = status !== undefined || text !== undefined;

  let mode: BadgeMode = 'none';
  if (hasChildren) {
    mode = showCount || dot ? 'overlay' : 'none';
  } else if (hasStatusText) {
    mode = 'status';
  } else if (showCount || dot) {
    mode = 'pill';
  }

  const displayCount =
    count !== undefined && max !== undefined && count > max
      ? `${max}+`
      : String(count ?? '');

  const ariaLabel =
    mode === 'status'
      ? undefined
      : showCount && !dot
        ? t(
            'badge.count',
            { 'zh-CN': '有 {count} 条', en: '{count} unread' },
            { count: count ?? 0 },
          )
        : mode === 'overlay' || mode === 'pill'
          ? t('badge.dot', { 'zh-CN': '有新内容', en: 'New content' })
          : undefined;

  const offsetX = offset?.[0] ?? 0;
  const offsetY = offset?.[1] ?? 0;
  const customVars = {
    '--yuki-badge-offset-x': `${offsetX}px`,
    '--yuki-badge-offset-y': `${offsetY}px`,
    ...(color ? { '--yuki-badge-bg': color } : null),
  } as CSSProperties;

  return (
    <span
      ref={ref}
      {...rest}
      data-slot="badge"
      data-mode={mode}
      data-size={size}
      data-status={status}
      aria-label={
        rest['aria-label'] ?? (mode === 'pill' ? ariaLabel : undefined)
      }
      className={cx(
        'yuki-badge',
        `yuki-badge--${size}`,
        mode === 'status' && 'yuki-badge--status',
        (mode === 'status' || mode === 'pill') && 'yuki-badge--standalone',
        status && `yuki-badge--${status}`,
        showCount && !dot && 'yuki-badge--count',
        dot && 'yuki-badge--dot',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...customVars, ...style }}
    >
      {hasChildren ? children : null}

      {mode === 'overlay' || mode === 'pill' ? (
        <>
          <span
            data-slot="indicator"
            className={cx('yuki-badge__indicator', classNames?.indicator)}
            style={styles?.indicator}
          >
            {dot ? (
              <span
                {...dotProps}
                data-slot="dot"
                className={cx('yuki-badge__dot', classNames?.dot, dotProps?.className)}
                style={{ ...styles?.dot, ...dotProps?.style }}
              />
            ) : (
              <span
                data-slot="count"
                aria-hidden="true"
                className={cx('yuki-badge__count', classNames?.count)}
                style={styles?.count}
              >
                {displayCount}
              </span>
            )}
          </span>
          {mode === 'overlay' ? (
            <span className="yuki-visually-hidden">{ariaLabel}</span>
          ) : null}
        </>
      ) : null}

      {mode === 'status' ? (
        <span
          data-slot="indicator"
          className={cx(
            'yuki-badge__indicator',
            'yuki-badge__indicator--status',
            classNames?.indicator,
          )}
          style={styles?.indicator}
        >
          <span
            {...dotProps}
            data-slot="dot"
            aria-hidden="true"
            className={cx('yuki-badge__dot', classNames?.dot, dotProps?.className)}
            style={{ ...styles?.dot, ...dotProps?.style }}
          />
          {text !== undefined && text !== null ? (
            <span
              data-slot="text"
              className={cx('yuki-badge__text', classNames?.text)}
              style={styles?.text}
            >
              {text}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
});

Badge.displayName = 'Badge';

export { STATUSES as badgeStatuses };
