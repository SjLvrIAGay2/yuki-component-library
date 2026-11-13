import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon/Icon';

/** 时间线节点颜色。 */
export type TimelineColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export type TimelineMode = 'start' | 'alternate';

export interface TimelineItem {
  /** 唯一标识。 */
  key?: string | number;
  /** 节点颜色；也可传入任意 CSS 颜色值。 */
  color?: TimelineColor | (string & {});
  /** 自定义节点。 */
  dot?: ReactNode;
  /** 辅助标签。 */
  label?: ReactNode;
  /** 内容。 */
  children?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** alternate 模式下的位置。 */
  position?: 'left' | 'right';
  /** 条目的额外类名。 */
  className?: string;
  /** 条目的额外样式。 */
  style?: CSSProperties;
}

export interface TimelineClassNames {
  root?: string;
  item?: string;
  rail?: string;
  dot?: string;
  line?: string;
  content?: string;
  label?: string;
  body?: string;
  pending?: string;
}

export interface TimelineStyles {
  root?: CSSProperties;
  item?: CSSProperties;
  rail?: CSSProperties;
  dot?: CSSProperties;
  line?: CSSProperties;
  content?: CSSProperties;
  label?: CSSProperties;
  body?: CSSProperties;
  pending?: CSSProperties;
}

export interface TimelineProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** 节点列表。 */
  items?: TimelineItem[];
  /** 排列模式。 */
  mode?: TimelineMode;
  /** 是否倒序展示。 */
  reverse?: boolean;
  /** 末尾的进行中节点；true 时使用默认文案。 */
  pending?: ReactNode | boolean;
  /** 进行中节点的自定义图标。 */
  pendingDot?: ReactNode;
  /** 时间线整体尺寸。 */
  size?: Size;
  /** 自定义尾部内容（渲染在节点之后）。 */
  children?: ReactNode;
  classNames?: TimelineClassNames;
  styles?: TimelineStyles;
}

const COLOR_CLASS: Record<TimelineColor, string> = {
  default: 'yuki-timeline__item--default',
  primary: 'yuki-timeline__item--primary',
  success: 'yuki-timeline__item--success',
  warning: 'yuki-timeline__item--warning',
  danger: 'yuki-timeline__item--danger',
};

function isNamedColor(
  color: TimelineColor | (string & {}),
): color is TimelineColor {
  return color in COLOR_CLASS;
}

export const Timeline = forwardRef<HTMLUListElement, TimelineProps>(
  function Timeline(
    inputProps,
    ref,
  ) {
    const {
      items = [],
      mode = 'start',
      reverse = false,
      pending,
      pendingDot,
      size: sizeProp,
      children,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = useComponentDefaults('Timeline', inputProps);
    const { t } = useLocale();
    const size = useComponentSize(sizeProp);
    const list = reverse ? [...items].reverse() : items;
    const showPending = pending !== undefined && pending !== false;
    const pendingContent =
      pending === true || pending === undefined
        ? t('timeline.pending', {
            'zh-CN': '进行中',
            en: 'In progress',
          })
        : pending;

    return (
      <ul
        ref={ref}
        {...rest}
        data-slot="timeline"
        data-mode={mode}
        data-size={size}
        className={cx(
          'yuki-timeline',
          `yuki-timeline--${size}`,
          `yuki-timeline--${mode}`,
          classNames?.root,
          className,
        )}
        style={{ ...styles?.root, ...style }}
      >
        {list.map((item, index) => {
          const isLast = index === list.length - 1 && !showPending;
          const color = item.color;
          const namedColor: TimelineColor | undefined =
            color === undefined
              ? 'default'
              : isNamedColor(color)
                ? color
                : undefined;
          const colorClass =
            namedColor !== undefined ? COLOR_CLASS[namedColor] : undefined;
          const customColor =
            color !== undefined && !isNamedColor(color)
              ? { '--yuki-timeline-dot-color': color }
              : undefined;
          const position =
            item.position ?? (index % 2 === 0 ? 'left' : 'right');
          return (
            <li
              key={item.key ?? index}
              data-slot="item"
              data-color={
                namedColor !== undefined && namedColor !== 'default'
                  ? namedColor
                  : undefined
              }
              className={cx(
                'yuki-timeline__item',
                colorClass,
                mode === 'alternate' && `yuki-timeline__item--${position}`,
                item.className,
                classNames?.item,
              )}
              style={
                {
                  ...customColor,
                  ...styles?.item,
                  ...item.style,
                } as CSSProperties
              }
            >
              <div
                data-slot="rail"
                className={cx('yuki-timeline__rail', classNames?.rail)}
                style={styles?.rail}
              >
                <span
                  data-slot="dot"
                  className={cx(
                    'yuki-timeline__dot',
                    item.dot !== undefined && 'yuki-timeline__dot--custom',
                    classNames?.dot,
                  )}
                  style={styles?.dot}
                >
                  {item.dot}
                </span>
                {isLast ? null : (
                  <span
                    data-slot="line"
                    aria-hidden="true"
                    className={cx('yuki-timeline__line', classNames?.line)}
                    style={styles?.line}
                  />
                )}
              </div>
              <div
                data-slot="content"
                className={cx('yuki-timeline__content', classNames?.content)}
                style={styles?.content}
              >
                {item.label !== undefined && item.label !== null ? (
                  <div
                    data-slot="label"
                    className={cx('yuki-timeline__label', classNames?.label)}
                    style={styles?.label}
                  >
                    {item.label}
                  </div>
                ) : null}
                <div
                  data-slot="body"
                  className={cx('yuki-timeline__body', classNames?.body)}
                  style={styles?.body}
                >
                  {item.children ?? <>{item.title != null && <strong>{item.title}</strong>}{item.description != null && <div>{item.description}</div>}</>}
                </div>
              </div>
            </li>
          );
        })}

        {showPending ? (
          <li
            data-slot="pending"
            className={cx(
              'yuki-timeline__item',
              'yuki-timeline__item--pending',
              classNames?.pending,
            )}
            style={styles?.pending}
          >
            <div
              data-slot="rail"
              className={cx('yuki-timeline__rail', classNames?.rail)}
              style={styles?.rail}
            >
              <span
                data-slot="dot"
                className={cx(
                  'yuki-timeline__dot',
                  'yuki-timeline__dot--custom',
                  'yuki-timeline__dot--pending',
                  classNames?.dot,
                )}
                style={styles?.dot}
              >
                {pendingDot ?? <Icon name="loader" spin />}
              </span>
            </div>
            <div
              data-slot="content"
              className={cx('yuki-timeline__content', classNames?.content)}
              style={styles?.content}
            >
              <div
                data-slot="body"
                className={cx('yuki-timeline__body', classNames?.body)}
                style={styles?.body}
              >
                {pendingContent}
              </div>
            </div>
          </li>
        ) : null}

        {children}
      </ul>
    );
  },
);

Timeline.displayName = 'Timeline';
