import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { cx } from '../../internal/cx';
import { useEventCallback, useInView, useVirtualList } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Pagination, type PaginationProps } from '../pagination';
import { usePagination } from '../pagination/usePagination';

export type ListKey = string | number;
const END_MARGIN = 80;

function ListEnd({ viewport, loading, onEndReached }: {
  viewport: RefObject<HTMLDivElement | null>;
  loading: boolean;
  onEndReached: () => void;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({
    root: viewport.current,
    rootMargin: `0px 0px ${END_MARGIN}px 0px`,
  });
  const delivered = useRef(false);
  const notify = useEventCallback(onEndReached);
  useEffect(() => {
    if (!inView) {
      delivered.current = false;
    } else if (!loading && !delivered.current) {
      delivered.current = true;
      notify();
    }
  }, [inView, loading, notify]);
  return <div ref={ref} data-slot="list-end" aria-hidden="true" style={{ height: 1 }} />;
}

export interface ListClassNames {
  root?: string;
  header?: string;
  body?: string;
  item?: string;
  avatar?: string;
  itemMain?: string;
  itemTitle?: string;
  itemDescription?: string;
  itemMeta?: string;
  itemExtra?: string;
  itemAction?: string;
  footer?: string;
  empty?: string;
  loading?: string;
  spinner?: string;
  pagination?: string;
}

export interface ListStyles {
  root?: StyleProperties;
  header?: StyleProperties;
  body?: StyleProperties;
  item?: StyleProperties;
  avatar?: StyleProperties;
  itemMain?: StyleProperties;
  itemTitle?: StyleProperties;
  itemDescription?: StyleProperties;
  itemMeta?: StyleProperties;
  itemExtra?: StyleProperties;
  itemAction?: StyleProperties;
  footer?: StyleProperties;
  empty?: StyleProperties;
  loading?: StyleProperties;
  spinner?: StyleProperties;
  pagination?: StyleProperties;
}

/** Responsive grid config: a number is a fixed column count. */
export interface ListGridConfig {
  columns?: number;
  /** Space token step used for the gap. Defaults to 4 (16px). */
  gutter?: number;
}

export type ListPaginationConfig = Pick<PaginationProps,
  'page' | 'defaultPage' | 'pageSize' | 'defaultPageSize' | 'total' | 'onChange' |
  'showSizeChanger' | 'showTotal' | 'simple' | 'pageSizeOptions'
>;

export type ListItemLayout = 'horizontal' | 'vertical';

export interface ListProps<T>
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children' | 'onChange'> {
  /** The data to render. */
  items?: readonly T[];
  /** Render an item; omitted, a title/description/extra default layout is used. */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Stable key for each item. Defaults to `item.key`, then the index. */
  rowKey?: keyof T | ((item: T, index: number) => ListKey);
  header?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  /** Draw separators between items (ignored in grid mode). */
  split?: boolean;
  itemLayout?: ListItemLayout;
  /** Render items as a CSS grid. Not combined with `virtual`. */
  grid?: number | ListGridConfig;
  /** Client-side pagination with the shared Pagination component. */
  pagination?: false | ListPaginationConfig;
  loading?: boolean;
  /** Content or a renderer called when the list is empty. */
  empty?: ReactNode | (() => ReactNode);
  size?: Size;
  /** Virtualise items inside a fixed-height scroll viewport. */
  virtual?: { height: number; itemSize?: number; overscan?: number };
  /** Request the next batch when the list's end approaches. Pass undefined when exhausted. */
  onEndReached?: () => void;
  classNames?: ListClassNames;
  styles?: ListStyles;
}

function resolveRowKey<T>(
  item: T,
  index: number,
  rowKey?: keyof T | ((item: T, index: number) => ListKey),
): ListKey {
  if (typeof rowKey === 'function') return rowKey(item, index);
  if (rowKey != null) {
    const value = item[rowKey] as unknown;
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  if (item != null && typeof item === 'object' && 'key' in (item as Record<string, unknown>)) {
    const value = (item as Record<string, unknown>).key;
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return index;
}

function defaultItemRender<T>(
  item: T,
  classNames: ListClassNames | undefined,
  styles: ListStyles | undefined,
): ReactNode {
  if (item == null || typeof item !== 'object') {
    return typeof item === 'string' || typeof item === 'number' ? String(item) : null;
  }
  const record = item as Record<string, unknown>;
  const title = record.title ?? record.label ?? record.name;
  const description = record.description ?? record.content;
  const extra = record.extra;
  const avatar = record.avatar ?? record.icon;
  const actions = record.actions;
  const meta = record.meta;

  if ([title, description, extra, avatar, actions, meta].every(value => value == null)) return null;

  return (
    <>
      {avatar != null && (
        <div
          data-slot="avatar"
          className={cx('yuki-list__avatar', classNames?.avatar)}
          style={styles?.avatar}
        >
          {avatar as ReactNode}
        </div>
      )}
      <div
        data-slot="item-main"
        className={cx('yuki-list__item-main', classNames?.itemMain)}
        style={styles?.itemMain}
      >
        {title != null && (
          <div
            data-slot="item-title"
            className={cx('yuki-list__item-title', classNames?.itemTitle)}
            style={styles?.itemTitle}
          >
            {title as ReactNode}
          </div>
        )}
        {description != null && (
          <div
            data-slot="item-description"
            className={cx('yuki-list__item-description', classNames?.itemDescription)}
            style={styles?.itemDescription}
          >
            {description as ReactNode}
          </div>
        )}
        {meta != null && (
          <div
            data-slot="item-meta"
            className={cx('yuki-list__item-meta', classNames?.itemMeta)}
            style={styles?.itemMeta}
          >
            {meta as ReactNode}
          </div>
        )}
      </div>
      {extra != null && (
        <div
          data-slot="item-extra"
          className={cx('yuki-list__item-extra', classNames?.itemExtra)}
          style={styles?.itemExtra}
        >
          {extra as ReactNode}
        </div>
      )}
      {actions != null && (
        <div
          data-slot="item-action"
          className={cx('yuki-list__item-action', classNames?.itemAction)}
          style={styles?.itemAction}
        >
          {actions as ReactNode}
        </div>
      )}
    </>
  );
}

interface ItemShellProps {
  children: ReactNode;
  layout: ListItemLayout;
  bordered: boolean;
  split: boolean;
  interactive: boolean;
  virtual?: { top: number; height: number };
  classNames?: ListClassNames;
  styles?: ListStyles;
}

function ItemShell({
  children,
  layout,
  bordered,
  split,
  interactive,
  virtual,
  classNames,
  styles,
}: ItemShellProps) {
  return (
    <li
      data-slot="item"
      data-layout={layout}
      className={cx(
        'yuki-list__item',
        `yuki-list__item--${layout}`,
        bordered && 'yuki-list__item--bordered',
        split && 'yuki-list__item--split',
        interactive && 'yuki-list__item--interactive',
        virtual && 'yuki-list__item--virtual',
        classNames?.item,
      )}
      style={{
        ...(virtual
          ? {
              position: 'absolute' as const,
              top: virtual.top,
              insetInline: 0,
              height: virtual.height,
            }
          : undefined),
        ...styles?.item,
      }}
    >
      {children}
    </li>
  );
}

function ListInner<T>(
  inputProps: ListProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const {
    items = [],
    renderItem,
    rowKey,
    header,
    footer,
    bordered = false,
    split = true,
    itemLayout = 'horizontal',
    grid,
    pagination = false,
    loading = false,
    empty,
    size: sizeProp,
    virtual,
    onEndReached,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('List', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();

  const paginationConfig = pagination === false ? null : pagination;

  const { total, pageSize, page, changePage } = usePagination({
    ...paginationConfig,
    total: paginationConfig?.total ?? items.length,
  });
  const pagedData = paginationConfig
    ? items.slice((page - 1) * pageSize, page * pageSize)
    : items;

  const viewportRef = useRef<HTMLDivElement>(null);
  // Each appended batch needs a fresh observation of its new end position.
  const sentinel = onEndReached && !pagination
    ? <ListEnd key={items.length} viewport={viewportRef} loading={loading} onEndReached={onEndReached} />
    : null;
  const itemSize = virtual?.itemSize ?? 64;
  const virtualizer = useVirtualList({
    count: virtual ? pagedData.length : 0,
    itemSize,
    overscan: virtual?.overscan,
    scrollRef: viewportRef,
    enabled: Boolean(virtual),
  });

  const virtualItems = virtual
    ? virtualizer.virtualItems.map((item) => ({ item, dataIndex: item.index }))
    : [];

  const gridColumns = grid == null ? 1 : typeof grid === 'number' ? grid : (grid.columns ?? 1);
  const gutter = typeof grid === 'object' && grid.gutter != null ? grid.gutter : 4;
  const isGrid = grid != null && !virtual;

  const listStyle: CSSProperties | undefined = isGrid
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, gridColumns)}, minmax(0, 1fr))`,
        gap: `calc(var(--yuki-space-4) * ${gutter})`,
      }
    : undefined;

  const renderItems = (indices: number[], virtualMode: boolean) => (
    <ul
      role="list"
      data-slot="items"
      className={cx('yuki-list__items', isGrid && 'yuki-list__items--grid')}
      style={{
        ...listStyle,
        ...(virtualMode ? { position: 'absolute', inset: 0, margin: 0, padding: 0 } : undefined),
      }}
    >
      {indices.map((dataIndex, position) => {
        const item = pagedData[dataIndex] as T;
        const key = resolveRowKey(item, (page - 1) * pageSize + dataIndex, rowKey);
        const virtualItem = virtualMode ? virtualizer.virtualItems[position] : undefined;
        return (
          <ItemShell
            key={key}
            layout={itemLayout}
            bordered={bordered}
            split={split && !isGrid}
            interactive={Boolean(rest.onClick)}
            virtual={
              virtualItem
                ? { top: virtualItem.start, height: virtualItem.size }
                : undefined
            }
            classNames={classNames}
            styles={styles}
          >
            {renderItem
              ? renderItem(item, dataIndex)
              : defaultItemRender(item, classNames, styles)}
          </ItemShell>
        );
      })}
    </ul>
  );

  const showEmpty = !loading && pagedData.length === 0;

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="list"
      data-size={size}
      data-bordered={bordered || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cx('yuki-list', `yuki-list--${size}`, classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {header != null && (
        <div
          data-slot="header"
          className={cx('yuki-list__header', classNames?.header)}
          style={styles?.header}
        >
          {header}
        </div>
      )}

      <div className="yuki-list__content">
        {virtual ? (
          <div
            ref={viewportRef}
            data-slot="body"
            className={cx('yuki-list__viewport', 'yuki-scrollbar', classNames?.body)}
            style={{ maxHeight: virtual.height, ...styles?.body }}
          >
            <div className="yuki-list__virtual-spacer" style={{ height: virtualizer.totalSize }}>
              {renderItems(
                virtualItems.map((entry) => entry.dataIndex),
                true,
              )}
            </div>
            {sentinel}
          </div>
        ) : (
          <div data-slot="body" className={cx('yuki-list__body', classNames?.body)} style={styles?.body}>
            {renderItems(
              pagedData.map((_, index) => index),
              false,
            )}
            {sentinel}
          </div>
        )}

        {showEmpty && (
          <div
            data-slot="empty"
            className={cx('yuki-list__empty', classNames?.empty)}
            style={styles?.empty}
          >
            {(typeof empty === 'function' ? empty() : empty) ?? t('table.empty')}
          </div>
        )}

        {loading && (
          <div
            data-slot="loading"
            role="status"
            aria-live="polite"
            className={cx('yuki-list__loading', classNames?.loading)}
            style={styles?.loading}
          >
            <span
              aria-hidden="true"
              data-slot="spinner"
              className={cx('yuki-list__spinner', classNames?.spinner)}
              style={styles?.spinner}
            />
            <span className="yuki-visually-hidden">{t('table.loading')}</span>
          </div>
        )}
      </div>

      {paginationConfig && (total > pageSize || paginationConfig.showSizeChanger) && (
        <div
          data-slot="pagination"
          className={cx('yuki-list__pagination', classNames?.pagination)}
          style={styles?.pagination}
        >
          <Pagination
            total={total}
            page={page}
            pageSize={pageSize}
            pageSizeOptions={paginationConfig.pageSizeOptions}
            showSizeChanger={paginationConfig.showSizeChanger}
            showTotal={paginationConfig.showTotal}
            simple={paginationConfig.simple}
            size={size === 'lg' ? 'md' : size}
            onChange={changePage}
          />
        </div>
      )}

      {footer != null && (
        <div
          data-slot="footer"
          className={cx('yuki-list__footer', classNames?.footer)}
          style={styles?.footer}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * A flexible list with header/footer, optional grid layout, client-side
 * pagination, loading/empty states and virtual scrolling.
 */
export const List = forwardRef(ListInner) as <T>(
  props: ListProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
