import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, type Size } from '../../theme';

export type DescriptionsLayout = 'horizontal' | 'vertical';

export interface DescriptionItem {
  /** 唯一标识。 */
  key?: string | number;
  /** 标签。 */
  label?: ReactNode;
  /** 内容。 */
  children?: ReactNode;
  value?: ReactNode;
  /** 占据的列数。 */
  span?: number;
  /** 标签的额外样式。 */
  labelStyle?: CSSProperties;
  /** 内容的额外样式。 */
  contentStyle?: CSSProperties;
  /** 条目的额外类名。 */
  className?: string;
}

export interface DescriptionsClassNames {
  root?: string;
  header?: string;
  title?: string;
  extra?: string;
  table?: string;
  item?: string;
  label?: string;
  content?: string;
}

export interface DescriptionsStyles {
  root?: CSSProperties;
  header?: CSSProperties;
  title?: CSSProperties;
  extra?: CSSProperties;
  table?: CSSProperties;
  item?: CSSProperties;
  label?: CSSProperties;
  content?: CSSProperties;
}

export interface DescriptionsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** 描述项列表。 */
  items?: DescriptionItem[];
  /** 标题。 */
  title?: ReactNode;
  /** 标题右侧的附加内容。 */
  extra?: ReactNode;
  /** 每行列数。 */
  column?: number;
  /** 是否展示边框。 */
  bordered?: boolean;
  /** 标签与内容的排列方向。 */
  layout?: DescriptionsLayout;
  /** 是否在标签后展示冒号。 */
  colon?: boolean;
  /** 尺寸。 */
  size?: Size;
  /** 自定义标签渲染。 */
  labelRender?: (item: DescriptionItem, index: number) => ReactNode;
  /** 自定义内容渲染。 */
  contentRender?: (item: DescriptionItem, index: number) => ReactNode;
  classNames?: DescriptionsClassNames;
  styles?: DescriptionsStyles;
}

export const Descriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
  function Descriptions(
    inputProps,
    ref,
  ) {
    const {
      items = [],
      title,
      extra,
      column = 3,
      bordered = false,
      layout = 'horizontal',
      colon = true,
      size: sizeProp,
      labelRender,
      contentRender,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = useComponentDefaults('Descriptions', inputProps);
    const size = useComponentSize(sizeProp);
    const columns = Math.max(1, column);
    const hasHeader = title !== undefined || extra !== undefined;

    return (
      <div
        ref={ref}
        {...rest}
        data-slot="descriptions"
        data-size={size}
        data-layout={layout}
        data-bordered={bordered || undefined}
        data-colon={colon || undefined}
        className={cx(
          'yuki-descriptions',
          `yuki-descriptions--${size}`,
          `yuki-descriptions--${layout}`,
          bordered && 'yuki-descriptions--bordered',
          colon && 'yuki-descriptions--colon',
          classNames?.root,
          className,
        )}
        style={
          {
            '--yuki-descriptions-columns': columns,
            ...styles?.root,
            ...style,
          } as CSSProperties
        }
      >
        {hasHeader ? (
          <div
            data-slot="header"
            className={cx('yuki-descriptions__header', classNames?.header)}
            style={styles?.header}
          >
            {title !== undefined && title !== null ? (
              <div
                data-slot="title"
                className={cx('yuki-descriptions__title', classNames?.title)}
                style={styles?.title}
              >
                {title}
              </div>
            ) : null}
            {extra !== undefined && extra !== null ? (
              <div
                data-slot="extra"
                className={cx('yuki-descriptions__extra', classNames?.extra)}
                style={styles?.extra}
              >
                {extra}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          data-slot="table"
          className={cx('yuki-descriptions__table', classNames?.table)}
          style={styles?.table}
        >
          {items.map((item, index) => {
            const span =
              item.span !== undefined
                ? Math.min(Math.max(1, item.span), columns)
                : undefined;
            return (
              <div
                key={item.key ?? index}
                data-slot="item"
                className={cx(
                  'yuki-descriptions__item',
                  item.className,
                  classNames?.item,
                )}
                style={
                  {
                    ...(span !== undefined
                      ? { gridColumn: `span ${span}` }
                      : null),
                    ...styles?.item,
                  } as CSSProperties
                }
              >
                <div
                  data-slot="label"
                  className={cx(
                    'yuki-descriptions__label',
                    classNames?.label,
                  )}
                  style={{ ...styles?.label, ...item.labelStyle }}
                >
                  {labelRender ? labelRender(item, index) : item.label}
                </div>
                <div
                  data-slot="content"
                  className={cx(
                    'yuki-descriptions__content',
                    classNames?.content,
                  )}
                  style={{ ...styles?.content, ...item.contentStyle }}
                >
                  {contentRender ? contentRender(item, index) : item.children ?? item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

Descriptions.displayName = 'Descriptions';
