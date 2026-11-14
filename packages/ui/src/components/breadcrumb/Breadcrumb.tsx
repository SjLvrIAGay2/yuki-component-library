import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useLocale } from '../../theme';

export interface BreadcrumbItem {
  /** Stable identity; falls back to the index. */
  key?: string;
  title?: ReactNode;
  label?: ReactNode;
  /** When present the item renders as a link. */
  href?: string;
  /** Optional leading node (usually an `<Icon />`). */
  icon?: ReactNode;
  /** Native click handler for the item link. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

export interface BreadcrumbClassNames {
  root?: string;
  list?: string;
  item?: string;
  link?: string;
  icon?: string;
  separator?: string;
  current?: string;
}

export interface BreadcrumbStyles {
  root?: StyleProperties;
  list?: StyleProperties;
  item?: StyleProperties;
  link?: StyleProperties;
  icon?: StyleProperties;
  separator?: StyleProperties;
  current?: StyleProperties;
}

export interface BreadcrumbProps
  extends Omit<WithStyle<HTMLAttributes<HTMLElement>>, 'children'> {
  items: BreadcrumbItem[];
  current?: string;
  /** Node between items. Defaults to a calm `/`. */
  separator?: ReactNode;
  /** Replace how a single crumb renders. */
  itemRender?: (item: BreadcrumbItem, index: number, items: BreadcrumbItem[]) => ReactNode;
  classNames?: BreadcrumbClassNames;
  styles?: BreadcrumbStyles;
}

/**
 * Hierarchy trail. The last crumb is the current page and is announced with
 * `aria-current="page"`; every crumb except the last may be a link.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  inputProps,
  ref,
) {
  const { items, current, separator = '/', itemRender, classNames, styles, className, style, ...rest } = useComponentDefaults('Breadcrumb', inputProps);
  const { t } = useLocale();
  const lastIndex = items.length - 1;
  const label =
    rest['aria-label'] ?? t('breadcrumb.label', { 'zh-CN': '面包屑导航', 'en-US': 'Breadcrumb' });

  return (
    <nav
      {...rest}
      ref={ref}
      data-slot="breadcrumb"
      aria-label={label}
      className={cx('yuki-breadcrumb', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      <ol data-slot="list" className={cx('yuki-breadcrumb__list', classNames?.list)} style={styles?.list}>
        {items.map((item, index) => {
          const isCurrent = current !== undefined ? current === item.href : index === lastIndex;
          const content = itemRender ? (
            itemRender(item, index, items)
          ) : item.href && !item.disabled ? (
              <a
                data-slot="link"
                className={cx('yuki-breadcrumb__link', classNames?.link)}
                style={styles?.link}
                href={item.href}
                onClick={item.onClick}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {item.icon != null && (
                  <span
                    aria-hidden="true"
                    data-slot="icon"
                    className={cx('yuki-breadcrumb__icon', classNames?.icon)}
                    style={styles?.icon}
                  >
                    {item.icon}
                  </span>
                )}
                {item.title ?? item.label}
              </a>
            ) : (
              <span
                data-slot={isCurrent ? 'current' : 'text'}
                className={cx(
                  isCurrent ? 'yuki-breadcrumb__current' : 'yuki-breadcrumb__text',
                  isCurrent ? classNames?.current : undefined,
                )}
                style={isCurrent ? styles?.current : undefined}
                aria-current={isCurrent ? 'page' : undefined}
                aria-disabled={item.disabled || undefined}
                data-disabled={item.disabled || undefined}
              >
                {item.icon != null && (
                  <span
                    aria-hidden="true"
                    data-slot="icon"
                    className={cx('yuki-breadcrumb__icon', classNames?.icon)}
                    style={styles?.icon}
                  >
                    {item.icon}
                  </span>
                )}
                {item.title ?? item.label}
              </span>
            );

          return (
            <li
              key={item.key ?? index}
              data-slot="item"
              className={cx('yuki-breadcrumb__item', classNames?.item)}
              style={styles?.item}
              data-current={isCurrent || undefined}
            >
              {content}
              {index !== lastIndex && (
                <span
                  aria-hidden="true"
                  data-slot="separator"
                  className={cx('yuki-breadcrumb__separator', classNames?.separator)}
                  style={styles?.separator}
                >
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';
