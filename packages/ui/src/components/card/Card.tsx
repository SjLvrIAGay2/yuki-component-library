import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  Children, isValidElement, forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { CardContent, CardHeader, CardFooter } from './CardParts';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

export type CardVariant = 'default' | 'elevated' | 'ghost';

export interface CardClassNames {
  root?: string;
  cover?: string;
  header?: string;
  title?: string;
  extra?: string;
  body?: string;
  footer?: string;
  actions?: string;
  action?: string;
  loading?: string;
}

export interface CardStyles {
  root?: StyleProperties;
  cover?: StyleProperties;
  header?: StyleProperties;
  title?: StyleProperties;
  extra?: StyleProperties;
  body?: StyleProperties;
  footer?: StyleProperties;
  actions?: StyleProperties;
  action?: StyleProperties;
  loading?: StyleProperties;
}

export interface CardProps
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
  /** 卡片标题。 */
  title?: ReactNode;
  /** 标题右侧的附加内容。 */
  extra?: ReactNode;
  /** 顶部封面内容，例如图片。 */
  cover?: ReactNode;
  /** 底部自定义区域。 */
  footer?: ReactNode;
  /** 底部操作按钮列表，等分排列。 */
  actions?: ReactNode[];
  /** 悬停时抬升阴影。 */
  hoverable?: boolean;
  /** 加载态，使用骨架占位。 */
  loading?: boolean;
  /** 卡片密度。 */
  size?: Size;
  /** 视觉变体。 */
  variant?: CardVariant;
  classNames?: CardClassNames;
  styles?: CardStyles;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  inputProps,
  ref,
) {
  const {
    title,
    extra,
    cover,
    footer,
    actions,
    hoverable = false,
    loading = false,
    size: sizeProp,
    variant = 'default',
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = useComponentDefaults('Card', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();

  const compound = !loading && Children.toArray(children).some(child => isValidElement(child) &&
    (child.type === CardHeader || child.type === CardContent || child.type === CardFooter));
  const hasHeader = title !== undefined || extra !== undefined;
  const hasActions = Array.isArray(actions) && actions.length > 0;

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="card"
      data-size={size}
      data-variant={variant}
      data-hoverable={hoverable || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cx(
        'yuki-card',
        `yuki-card--${size}`,
        `yuki-card--${variant}`,
        hoverable && 'yuki-card--hoverable',
        loading && 'yuki-card--loading',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {cover !== undefined && cover !== null ? (
        <div
          data-slot="cover"
          className={cx('yuki-card__cover', classNames?.cover)}
          style={styles?.cover}
        >
          {cover}
        </div>
      ) : null}

      {hasHeader ? (
        <div
          data-slot="header"
          className={cx('yuki-card__header', classNames?.header)}
          style={styles?.header}
        >
          {title !== undefined && title !== null ? (
            <div
              data-slot="title"
              className={cx('yuki-card__title', classNames?.title)}
              style={styles?.title}
            >
              {title}
            </div>
          ) : null}
          {extra !== undefined && extra !== null ? (
            <div
              data-slot="extra"
              className={cx('yuki-card__extra', classNames?.extra)}
              style={styles?.extra}
            >
              {extra}
            </div>
          ) : null}
        </div>
      ) : null}

      {compound ? children : <div
        data-slot="body"
        className={cx('yuki-card__body', classNames?.body)}
        style={styles?.body}
      >
        {loading ? (
          <div
            data-slot="loading"
            className={cx('yuki-card__loading', classNames?.loading)}
            style={styles?.loading}
            aria-label={t('common.loading', {
              'zh-CN': '加载中',
              en: 'Loading',
            })}
          >
            <span className="yuki-card__loading-line" />
            <span className="yuki-card__loading-line" />
            <span className="yuki-card__loading-line" />
          </div>
        ) : (
          children
        )}
      </div>}

      {footer !== undefined && footer !== null ? (
        <div
          data-slot="footer"
          className={cx('yuki-card__footer', classNames?.footer)}
          style={styles?.footer}
        >
          {footer}
        </div>
      ) : null}

      {hasActions ? (
        <div
          data-slot="actions"
          className={cx('yuki-card__actions', classNames?.actions)}
          style={styles?.actions}
        >
          {actions.map((action, index) => (
            <div
              key={index}
              data-slot="action"
              className={cx('yuki-card__action', classNames?.action)}
              style={styles?.action}
            >
              {action}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
});

Card.displayName = 'Card';
