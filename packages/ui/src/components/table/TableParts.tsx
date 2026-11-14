import type { WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cx } from '../../internal/cx';
import { formatMessage, useLocale } from '../../locale';
import { Icon } from '../icon';
import { useComponentDefaults, useComponentSize } from '../../theme';
export interface CompoundTableProps extends WithStyle<TableHTMLAttributes<HTMLTableElement>> {
  containerProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}
export const CompoundTable = forwardRef<HTMLTableElement, CompoundTableProps>(function CompoundTable(input, ref) {
  const {
    className,
    containerProps,
    size: sizeProp,
    striped = false,
    hoverable = true,
    bordered = false,
    ...props
  } = useComponentDefaults('Table', input);
  const size = useComponentSize(sizeProp);
  const { messages } = useLocale();
  return (
    <div className="yuki-table yuki-table--compound" data-size={size} data-bordered={bordered || undefined}
      data-striped={striped || undefined} data-hover={hoverable || undefined}>
    <div
      {...containerProps}
      className={cx('yuki-table__container', 'yuki-scrollbar', containerProps?.className)}
      tabIndex={containerProps?.tabIndex ?? 0}
      role={containerProps?.role ?? 'region'}
      aria-label={containerProps?.['aria-label'] ?? messages.tableRegion}
    >
      <table
        {...props}
        ref={ref}
        className={cx('yuki-table__table', className)}
      />
    </div>
    </div>
  );
});
export function TableHeader(props: WithStyle<HTMLAttributes<HTMLTableSectionElement>>) {
  return <thead {...props} className={cx('yuki-table__header', props.className)} />;
}
export function TableBody(props: WithStyle<HTMLAttributes<HTMLTableSectionElement>>) {
  return <tbody {...props} className={cx('yuki-table__body', props.className)} />;
}
export function TableRow(props: WithStyle<HTMLAttributes<HTMLTableRowElement>>) {
  return <tr {...props} className={cx('yuki-table__row', props.className)} />;
}
export type TableSortDirection = 'asc' | 'desc' | null;
export interface TableHeadProps extends WithStyle<ThHTMLAttributes<HTMLTableCellElement>> {
  sortable?: boolean;
  /** Controlled state; the caller applies sorting to its rows. */
  sortDirection?: TableSortDirection;
  onSortChange?: (next: TableSortDirection, event: MouseEvent<HTMLButtonElement>) => void;
  /** Plain column name used in the localized action label for complex children. */
  sortLabel?: string;
  /** Caller click handlers run first and can cancel the sorting request. */
  sortButtonProps?: Omit<WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>, 'type'>;
  /** Decorative content; null hides the default icon. */
  sortIcon?: ReactNode;
}
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  {
    sortable = false,
    sortDirection = null,
    onSortChange,
    sortLabel,
    sortButtonProps,
    sortIcon,
    className,
    children,
    ...props
  },
  ref,
) {
  const { messages } = useLocale();
  const next = sortDirection === null ? 'asc' : sortDirection === 'asc' ? 'desc' : null;
  const column =
    sortLabel ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : messages.tableSortColumn);
  const label = formatMessage(
    next === 'asc'
      ? messages.tableSortAscending
      : next === 'desc'
        ? messages.tableSortDescending
        : messages.tableSortClear,
    { column },
  );
  return (
    <th
      scope="col"
      {...props}
      ref={ref}
      className={cx('yuki-table__header-cell', className)}
      aria-sort={
        sortable
          ? sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : undefined
          : props['aria-sort']
      }
    >
      {sortable ? (
        <span className="yuki-table__header-inner">
          {children}
          <button
            {...sortButtonProps}
            type="button"
            className={cx('yuki-table__sort-trigger', sortDirection && 'yuki-table__sort-trigger--active', sortButtonProps?.className)}
            aria-label={sortButtonProps?.['aria-label'] ?? label}
            data-sort-direction={sortDirection ?? 'none'}
            onClick={(event) => {
              sortButtonProps?.onClick?.(event);
              if (!event.defaultPrevented && !sortButtonProps?.disabled)
                onSortChange?.(next, event);
            }}
          >
            <span className="yuki-table__sort-icon" aria-hidden="true">
              {sortButtonProps?.children !== undefined ? (
                sortButtonProps.children
              ) : sortIcon !== undefined ? (
                sortIcon
              ) : (
                <Icon name={sortDirection === 'asc' ? 'arrow-up' : sortDirection === 'desc' ? 'arrow-down' : 'arrow-up-down'} size="var(--yuki-icon-size-xs)" />
              )}
            </span>
          </button>
        </span>
      ) : (
        children
      )}
    </th>
  );
});
export function TableCell(props: WithStyle<TdHTMLAttributes<HTMLTableCellElement>>) {
  return <td {...props} className={cx('yuki-table__cell', props.className)} />;
}
export function TableCaption(props: WithStyle<HTMLAttributes<HTMLTableCaptionElement>>) {
  return <caption {...props} />;
}
