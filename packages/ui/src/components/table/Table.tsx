import type { StyleProperties, WithStyle } from '../../styles/properties';
import { CompoundTable, type CompoundTableProps } from './TableParts';
import { useComponentDefaults } from '../../theme';
import {
  Fragment,
  forwardRef,
  isValidElement,
  useId,
  useMemo,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useVirtualList } from '../../hooks';
import { useComponentSize, useLocale, type Size } from '../../theme';
import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import { Pagination, type PaginationProps } from '../pagination';
import { usePagination } from '../pagination/usePagination';
import { Popover } from '../popover';

export type TableKey = string | number;
export type TableSortOrder = 'ascend' | 'descend';
export type TableAlign = 'left' | 'center' | 'right';
export type TableFilterValue = string | number | boolean;

export interface TableSortState {
  columnKey: string;
  order: TableSortOrder;
}

/** Active filter values, keyed by column key. An empty array / missing key = no filter. */
export interface TableFilterState {
  [columnKey: string]: TableFilterValue[];
}

export interface TableFilterOption {
  label: ReactNode;
  value: TableFilterValue;
}

/** Context handed to `column.render` and the table-level `renderCell` fallback. */
export interface TableCellContext<T> {
  row: T;
  rowIndex: number;
  column: TableColumn<T>;
  columnKey: string;
  value: unknown;
}

export interface TableColumn<T> {
  /** Unique column id. Falls back to a path-joined `dataIndex`, then the index. */
  key?: string;
  /** Header content. */
  title?: ReactNode;
  /** Path into the row used for the cell value and default sorting/filtering. */
  dataIndex?: keyof T | string | readonly (string | number)[];
  width?: number | string;
  minWidth?: number | string;
  align?: TableAlign;
  /** Pin the column to an edge of the horizontal scroll area. */
  fixed?: 'left' | 'right';
  /** Enables the header sort control. */
  sortable?: boolean;
  /** Custom comparator; defaults to comparing the `dataIndex` values. */
  sorter?: (a: T, b: T) => number;
  /** Initial sort order for this column. */
  defaultSortOrder?: TableSortOrder;
  /** Sort cycle. Defaults to `['ascend', 'descend']`. */
  sortDirections?: readonly TableSortOrder[];
  /** Selectable filter options. The filter control only renders when this is set. */
  filters?: readonly TableFilterOption[];
  /** `false` turns the filter into single-select. Defaults to true. */
  filterMultiple?: boolean;
  /** Custom predicate for a filter value; defaults to value equality. */
  onFilter?: (value: TableFilterValue, row: T) => boolean;
  /** Custom cell renderer. */
  render?: (context: TableCellContext<T>) => ReactNode;
  /** Truncate overflowing cell content with an ellipsis. */
  ellipsis?: boolean;
  className?: string;
}

export interface TableSelectionCellContext<T> {
  row: T;
  rowIndex: number;
  selected: boolean;
  /** The default checkbox / radio. Render it to keep the built-in behaviour. */
  control: ReactNode;
}

export interface TableRowSelection<T> {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: readonly TableKey[];
  defaultSelectedRowKeys?: readonly TableKey[];
  onChange?: (selectedRowKeys: TableKey[], selectedRows: T[]) => void;
  getCheckboxProps?: (
    row: T,
    index: number,
  ) => { disabled?: boolean; name?: string; 'aria-label'?: string };
  columnWidth?: number | string;
  /** Keep the selection column pinned while scrolling horizontally. */
  fixed?: boolean;
  /** Hide the select-all checkbox in the header (checkbox type only). */
  hideSelectAll?: boolean;
  /** Replace the default control; `context.control` is the built-in one. */
  renderCell?: (context: TableSelectionCellContext<T>) => ReactNode;
}

export interface TableExpandIconContext<T> {
  expanded: boolean;
  row: T;
  rowIndex: number;
  toggle: () => void;
}

export interface TableExpandable<T> {
  expandedRowKeys?: readonly TableKey[];
  defaultExpandedRowKeys?: readonly TableKey[];
  onExpandedRowsChange?: (expandedRowKeys: TableKey[]) => void;
  expandedRowRender: (row: T, rowIndex: number) => ReactNode;
  /** Return false to remove the expand control for a row. */
  rowExpandable?: (row: T) => boolean;
  expandIcon?: (context: TableExpandIconContext<T>) => ReactNode;
  columnWidth?: number | string;
  fixed?: boolean;
  expandedRowClassName?: string;
}

export interface TablePaginationConfig extends Pick<PaginationProps,
  'page' | 'defaultPage' | 'pageSize' | 'defaultPageSize' | 'total' | 'onChange' |
  'showSizeChanger' | 'showTotal' | 'simple' | 'pageSizeOptions'
> {
  /** Enable when the supplied data contains only the current server page. */
  serverSide?: boolean;
}

export interface TableClassNames {
  root?: string;
  content?: string;
  container?: string;
  table?: string;
  header?: string;
  headerRow?: string;
  headerCell?: string;
  headerInner?: string;
  sortTrigger?: string;
  sortIcon?: string;
  filterTrigger?: string;
  filterIcon?: string;
  filterPanel?: string;
  filterOption?: string;
  filterCheck?: string;
  filterFooter?: string;
  filterReset?: string;
  body?: string;
  row?: string;
  rowExpanded?: string;
  cell?: string;
  cellEllipsis?: string;
  selectionCell?: string;
  selectionHeaderCell?: string;
  selectionCheckbox?: string;
  selectionRadio?: string;
  expandCell?: string;
  expandHeaderCell?: string;
  expandButton?: string;
  expandIcon?: string;
  expandedRow?: string;
  expandedCell?: string;
  expandedContent?: string;
  footer?: string;
  pagination?: string;
  empty?: string;
  loading?: string;
  spinner?: string;
}

export interface TableStyles {
  root?: StyleProperties;
  content?: StyleProperties;
  container?: StyleProperties;
  table?: StyleProperties;
  header?: StyleProperties;
  headerRow?: StyleProperties;
  headerCell?: StyleProperties;
  headerInner?: StyleProperties;
  sortTrigger?: StyleProperties;
  sortIcon?: StyleProperties;
  filterTrigger?: StyleProperties;
  filterIcon?: StyleProperties;
  filterPanel?: StyleProperties;
  filterOption?: StyleProperties;
  filterCheck?: StyleProperties;
  filterFooter?: StyleProperties;
  filterReset?: StyleProperties;
  body?: StyleProperties;
  row?: StyleProperties;
  rowExpanded?: StyleProperties;
  cell?: StyleProperties;
  cellEllipsis?: StyleProperties;
  selectionCell?: StyleProperties;
  selectionHeaderCell?: StyleProperties;
  selectionCheckbox?: StyleProperties;
  selectionRadio?: StyleProperties;
  expandCell?: StyleProperties;
  expandHeaderCell?: StyleProperties;
  expandButton?: StyleProperties;
  expandIcon?: StyleProperties;
  expandedRow?: StyleProperties;
  expandedCell?: StyleProperties;
  expandedContent?: StyleProperties;
  footer?: StyleProperties;
  pagination?: StyleProperties;
  empty?: StyleProperties;
  loading?: StyleProperties;
  spinner?: StyleProperties;
}

export interface TableProps<T>
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children' | 'onChange'> {
  columns: readonly TableColumn<T>[];
  /** Set a column key to false to hide its cells. Filtering and sorting still use all columns. */
  columnVisibility?: Readonly<Record<string, boolean>>;
  data?: readonly T[];
  rowKey?: keyof T | ((row: T, index: number) => TableKey);
  size?: Size;
  bordered?: boolean;
  striped?: boolean;
  /** Row hover highlight. Defaults to true. */
  hover?: boolean;
  /** Horizontal / vertical scrolling. `y` turns on the sticky header. */
  scroll?: { x?: number | string; y?: number | string };
  /** Keep the header pinned while scrolling vertically. Defaults to true with `scroll.y`. */
  stickyHeader?: boolean;
  /** Enable row virtualisation; requires a numeric `scroll.y`. */
  virtual?: boolean;
  /** Fixed row height used by virtualisation. Defaults from `size`. */
  rowHeight?: number;
  pagination?: false | TablePaginationConfig;
  loading?: boolean;
  empty?: ReactNode | (() => ReactNode);
  footerRender?: (data: readonly T[]) => ReactNode;
  /** Table-level cell fallback used when a column has no `render`. */
  renderCell?: (context: TableCellContext<T>) => ReactNode;
  rowClassName?: string | ((row: T, index: number) => string);
  onRow?: (row: T, index: number) => WithStyle<HTMLAttributes<HTMLTableRowElement>>;
  rowSelection?: TableRowSelection<T>;
  expandable?: TableExpandable<T>;
  sortState?: TableSortState | null;
  defaultSortState?: TableSortState | null;
  onSortChange?: (state: TableSortState | null) => void;
  filterState?: TableFilterState;
  defaultFilterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState, changedColumnKey: string) => void;
  classNames?: TableClassNames;
  styles?: TableStyles;
}

interface RenderColumn<T> {
  kind: 'expand' | 'selection' | 'data';
  key: string;
  column?: TableColumn<T>;
  width?: number | string;
  align: TableAlign;
  fixed?: 'left' | 'right';
  stickyLeft?: number;
  stickyRight?: number;
}

const DEFAULT_SORT_DIRECTIONS: readonly TableSortOrder[] = ['ascend', 'descend'];

function resolveColumnKey<T>(column: TableColumn<T>, index: number): string {
  if (column.key != null) return column.key;
  if (column.dataIndex != null) {
    return Array.isArray(column.dataIndex)
      ? column.dataIndex.join('.')
      : String(column.dataIndex);
  }
  return `column-${index}`;
}

function resolveRowKey<T>(
  row: T,
  index: number,
  rowKey?: keyof T | ((row: T, index: number) => TableKey),
): TableKey {
  if (typeof rowKey === 'function') return rowKey(row, index);
  if (rowKey != null) {
    const value = row[rowKey] as unknown;
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  if (row != null && typeof row === 'object' && 'key' in (row as Record<string, unknown>)) {
    const value = (row as Record<string, unknown>).key;
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return index;
}

function getPathValue(row: unknown, path: readonly (string | number)[]): unknown {
  let current: unknown = row;
  for (const segment of path) {
    if (current == null) return undefined;
    current = (current as Record<string | number, unknown>)[segment];
  }
  return current;
}

function getCellValue<T>(row: T, dataIndex: TableColumn<T>['dataIndex']): unknown {
  if (dataIndex == null) return undefined;
  return getPathValue(
    row,
    Array.isArray(dataIndex) ? dataIndex : [dataIndex as string | number],
  );
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function formatCellValue(value: unknown): ReactNode {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (isValidElement(value)) return value;
  return String(value);
}

function numericWidth(width: number | string | undefined): number {
  if (typeof width === 'number') return width;
  if (typeof width === 'string') {
    const match = /^(\d+(?:\.\d+)?)(?:px)?$/.exec(width.trim());
    if (match) return Number(match[1]);
  }
  return 0;
}

function deriveDefaultSort<T>(columns: readonly TableColumn<T>[]): TableSortState | null {
  for (let index = 0; index < columns.length; index += 1) {
    const column = columns[index];
    if (!column) continue;
    if (column.defaultSortOrder) {
      return { columnKey: resolveColumnKey(column, index), order: column.defaultSortOrder };
    }
  }
  return null;
}

function alignmentValue(align: TableAlign): 'left' | 'center' | 'right' {
  return align;
}

function TableInner<T>(
  inputProps: TableProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const {
    columns,
    columnVisibility,
    data = [],
    rowKey,
    size: sizeProp,
    bordered = false,
    striped = false,
    hover = true,
    scroll,
    stickyHeader,
    virtual = false,
    rowHeight,
    pagination = false,
    loading = false,
    empty,
    footerRender,
    renderCell,
    rowClassName,
    onRow,
    rowSelection,
    expandable,
    sortState: sortStateProp,
    defaultSortState,
    onSortChange,
    filterState: filterStateProp,
    defaultFilterState,
    onFilterChange,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Table', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const radioGroupName = useId();

  /* ----------------------------------------------------------------------- *
   * Sorting
   * --------------------------------------------------------------------- */
  const [sortState, setSortState] = useControllableState<TableSortState | null>({
    value: sortStateProp,
    defaultValue: defaultSortState === undefined ? deriveDefaultSort(columns) : defaultSortState,
    onChange: onSortChange,
  });

  /* ----------------------------------------------------------------------- *
   * Filtering
   * --------------------------------------------------------------------- */
  const changedFilterKeyRef = useRef('');
  const [filterState, setFilterState] = useControllableState<TableFilterState>({
    value: filterStateProp,
    defaultValue: defaultFilterState ?? {},
    onChange: (next) => onFilterChange?.(next, changedFilterKeyRef.current),
  });

  /* ----------------------------------------------------------------------- *
   * Expansion / selection
   * --------------------------------------------------------------------- */
  const [expandedKeys, setExpandedKeys] = useControllableState<readonly TableKey[]>({
    value: expandable?.expandedRowKeys,
    defaultValue: expandable?.defaultExpandedRowKeys ?? [],
    onChange: expandable
      ? (keys: readonly TableKey[]) => expandable.onExpandedRowsChange?.([...keys])
      : undefined,
  });

  const [selectedKeys, setSelectedKeys] = useControllableState<readonly TableKey[]>({
    value: rowSelection?.selectedRowKeys,
    defaultValue: rowSelection?.defaultSelectedRowKeys ?? [],
  });

  /* ----------------------------------------------------------------------- *
   * Pagination
   * --------------------------------------------------------------------- */
  const paginationConfig = pagination === false ? null : pagination;

  /* ----------------------------------------------------------------------- *
   * Data pipeline: filter → sort → page
   * --------------------------------------------------------------------- */
  const allRows = useMemo(
    () =>
      data.map((row, index) => ({ row, key: resolveRowKey(row, index, rowKey) })),
    [data, rowKey],
  );

  const filteredRows = useMemo(() => {
    const activeFilters = columns.flatMap((column, index) => {
      const values = filterState[resolveColumnKey(column, index)];
      return Array.isArray(values) && values.length > 0 ? [{ column, values }] : [];
    });
    if (!activeFilters.length) return allRows;

    return allRows.filter(({ row }) =>
      activeFilters.every(({ column, values }) => {
        const value = getCellValue(row, column.dataIndex);
        return values.some((filterValue) =>
          column.onFilter
            ? column.onFilter(filterValue, row)
            : Object.is(value, filterValue) || String(value) === String(filterValue),
        );
      }),
    );
  }, [columns, allRows, filterState]);

  const sortedRows = useMemo(() => {
    if (!sortState) return filteredRows;
    const columnIndex = columns.findIndex(
      (column, index) => resolveColumnKey(column, index) === sortState.columnKey,
    );
    const column = columns[columnIndex];
    if (!column) return filteredRows;
    const direction = sortState.order === 'ascend' ? 1 : -1;
    return [...filteredRows].sort(({ row: a }, { row: b }) => {
      const result = column.sorter
        ? column.sorter(a, b)
        : defaultCompare(getCellValue(a, column.dataIndex), getCellValue(b, column.dataIndex));
      return result * direction;
    });
  }, [columns, filteredRows, sortState]);

  const { total, pageSize, page: currentPage, changePage } = usePagination({
    ...paginationConfig,
    total: paginationConfig?.total ?? sortedRows.length,
  });
  const pagedRows = paginationConfig
    ? paginationConfig.serverSide
      ? sortedRows
      : sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedRows;

  /* ----------------------------------------------------------------------- *
   * Virtual scrolling
   * --------------------------------------------------------------------- */
  const virtualEnabled = Boolean(virtual && scroll?.y != null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const resolvedRowHeight =
    rowHeight ??
    (size === 'sm' ? 40 : size === 'lg' ? 56 : 48);
  const virtualizer = useVirtualList({
    count: virtualEnabled ? pagedRows.length : 0,
    itemSize: resolvedRowHeight,
    scrollRef: viewportRef,
    enabled: virtualEnabled,
  });

  /* ----------------------------------------------------------------------- *
   * Columns (expand / selection helper columns + user columns)
   * --------------------------------------------------------------------- */
  const expansionEnabled = Boolean(expandable) && !virtualEnabled;
  const renderColumns: RenderColumn<T>[] = [];

  if (expansionEnabled) {
    renderColumns.push({
      kind: 'expand',
      key: '__expand',
      width: expandable?.columnWidth ?? 48,
      align: 'center',
      fixed: expandable?.fixed ? 'left' : undefined,
    });
  }
  if (rowSelection) {
    renderColumns.push({
      kind: 'selection',
      key: '__selection',
      width: rowSelection.columnWidth ?? 48,
      align: 'center',
      fixed: rowSelection.fixed ? 'left' : undefined,
    });
  }
  columns.forEach((column, index) => {
    const key = resolveColumnKey(column, index);
    if (columnVisibility?.[key] === false) return;
    renderColumns.push({
      kind: 'data',
      key,
      column,
      width: column.width,
      align: column.align ?? 'left',
      fixed: column.fixed,
    });
  });

  let leftOffset = 0;
  for (const column of renderColumns) {
    if (column.fixed === 'left') {
      column.stickyLeft = leftOffset;
      leftOffset += numericWidth(column.width);
    }
  }
  let rightOffset = 0;
  for (let index = renderColumns.length - 1; index >= 0; index -= 1) {
    const column = renderColumns[index];
    if (column && column.fixed === 'right') {
      column.stickyRight = rightOffset;
      rightOffset += numericWidth(column.width);
    }
  }

  const stickyStyle = (column: RenderColumn<T>): CSSProperties | undefined => {
    if (column.fixed === 'left') {
      return { position: 'sticky', left: column.stickyLeft ?? 0 };
    }
    if (column.fixed === 'right') {
      return { position: 'sticky', right: column.stickyRight ?? 0 };
    }
    return undefined;
  };

  const columnCount = Math.max(1, renderColumns.length);

  /* ----------------------------------------------------------------------- *
   * Selection helpers
   * --------------------------------------------------------------------- */
  const selectedSet = useMemo(() => new Set<TableKey>(selectedKeys), [selectedKeys]);
  const getCheckboxProps = (row: T, index: number) => rowSelection?.getCheckboxProps?.(row, index);

  const isRowSelectable = (row: T, index: number): boolean =>
    !getCheckboxProps(row, index)?.disabled;

  const updateSelection = (keys: readonly TableKey[]) => {
    setSelectedKeys(keys);
    const keySet = new Set(keys);
    rowSelection?.onChange?.(
      [...keys],
      allRows.filter((entry) => keySet.has(entry.key)).map((entry) => entry.row),
    );
  };

  const toggleRowSelected = (key: TableKey, checked: boolean) => {
    if (rowSelection?.type === 'radio') {
      if (!checked) return;
      updateSelection([key]);
      return;
    }
    if (checked) {
      if (selectedSet.has(key)) return;
      updateSelection([...selectedKeys, key]);
    } else {
      updateSelection(selectedKeys.filter((entry) => !Object.is(entry, key)));
    }
  };

  const pageSelectableKeys = pagedRows
    .filter((entry, index) => isRowSelectable(entry.row, index))
    .map((entry) => entry.key);
  const pageSelectedKeys = pageSelectableKeys.filter((key) => selectedSet.has(key));
  const allSelected =
    pageSelectableKeys.length > 0 && pageSelectedKeys.length === pageSelectableKeys.length;
  const someSelected = pageSelectedKeys.length > 0 && !allSelected;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const next = new Set(selectedSet);
      pageSelectableKeys.forEach((key) => next.add(key));
      updateSelection([...next]);
    } else {
      updateSelection(selectedKeys.filter((key) => !pageSelectableKeys.some((pageKey) => Object.is(pageKey, key))));
    }
  };

  /* ----------------------------------------------------------------------- *
   * Expansion helpers
   * --------------------------------------------------------------------- */
  const isExpanded = (key: TableKey) => expandedKeys.some((entry) => Object.is(entry, key));

  const toggleExpanded = (key: TableKey) => {
    if (isExpanded(key)) {
      setExpandedKeys(expandedKeys.filter((entry) => !Object.is(entry, key)));
    } else {
      setExpandedKeys([...expandedKeys, key]);
    }
  };

  /* ----------------------------------------------------------------------- *
   * Filter helpers
   * --------------------------------------------------------------------- */
  const isOptionActive = (columnKey: string, value: TableFilterValue): boolean =>
    (filterState[columnKey] ?? []).some((entry) => Object.is(entry, value));

  const setColumnFilter = (columnKey: string, values: TableFilterValue[]) => {
    const next: TableFilterState = { ...filterState };
    if (values.length === 0) delete next[columnKey];
    else next[columnKey] = values;
    changedFilterKeyRef.current = columnKey;
    setFilterState(next);
  };

  const toggleFilterOption = (
    columnKey: string,
    value: TableFilterValue,
    multiple: boolean,
  ) => {
    const current = filterState[columnKey] ?? [];
    const exists = current.some((entry) => Object.is(entry, value));
    const nextValues = multiple
      ? exists
        ? current.filter((entry) => !Object.is(entry, value))
        : [...current, value]
      : exists
        ? []
        : [value];
    setColumnFilter(columnKey, nextValues);
  };

  const clearColumnFilter = (columnKey: string) => {
    const next: TableFilterState = { ...filterState };
    delete next[columnKey];
    changedFilterKeyRef.current = columnKey;
    setFilterState(next);
  };

  /* ----------------------------------------------------------------------- *
   * Header interactions
   * --------------------------------------------------------------------- */
  const toggleSort = (columnKey: string, column: TableColumn<T>) => {
    const directions = column.sortDirections ?? DEFAULT_SORT_DIRECTIONS;
    const active = sortState?.columnKey === columnKey ? sortState.order : null;
    const activeIndex = active ? directions.indexOf(active) : -1;
    const nextDirection = directions[activeIndex + 1] ?? null;
    setSortState(nextDirection ? { columnKey, order: nextDirection } : null);
  };

  /* ----------------------------------------------------------------------- *
   * Rendering
   * --------------------------------------------------------------------- */
  const renderSortIcon = (columnKey: string, column: TableColumn<T>): ReactNode => {
    const order = sortState?.columnKey === columnKey ? sortState.order : null;
    const name = order === 'ascend' ? 'sort-asc' : order === 'descend' ? 'sort-desc' : 'sort';
    return (
      <span
        aria-hidden="true"
        data-slot="sort-icon"
        data-order={order ?? 'none'}
        className={cx('yuki-table__sort-icon', classNames?.sortIcon, column.className)}
        style={styles?.sortIcon}
      >
        <Icon name={name} size="var(--yuki-icon-size-xs)" />
      </span>
    );
  };

  const renderHeaderCell = (renderColumn: RenderColumn<T>): ReactNode => {
    if (renderColumn.kind === 'expand') {
      return (
        <th
          key={renderColumn.key}
          scope="col"
          role="columnheader"
          data-slot="expand-header-cell"
          aria-label={t('table.expandColumn', { zh: '展开', en: 'Expand' })}
          className={cx(
            'yuki-table__header-cell',
            'yuki-table__header-cell--expand',
            classNames?.headerCell,
            classNames?.expandHeaderCell,
          )}
          style={{ ...stickyStyle(renderColumn), width: renderColumn.width, ...styles?.expandHeaderCell }}
        >
          <span className="yuki-visually-hidden">
            {t('table.expandColumn', { zh: '展开', en: 'Expand' })}
          </span>
        </th>
      );
    }

    if (renderColumn.kind === 'selection') {
      const isCheckbox = (rowSelection?.type ?? 'checkbox') === 'checkbox';
      return (
        <th
          key={renderColumn.key}
          scope="col"
          role="columnheader"
          data-slot="selection-header-cell"
          className={cx(
            'yuki-table__header-cell',
            'yuki-table__header-cell--selection',
            classNames?.headerCell,
            classNames?.selectionHeaderCell,
          )}
          style={{ ...stickyStyle(renderColumn), width: renderColumn.width, ...styles?.selectionHeaderCell }}
        >
          {isCheckbox && !rowSelection?.hideSelectAll ? (
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              disabled={pageSelectableKeys.length === 0}
              aria-label={t('table.selectAll', { zh: '全选', en: 'Select all' })}
              className={cx('yuki-table__selection-checkbox', classNames?.selectionCheckbox)}
              styles={styles?.selectionCheckbox ? { root: styles.selectionCheckbox } : undefined}
              onChange={(checked) => toggleSelectAll(checked)}
            />
          ) : (
            <span className="yuki-visually-hidden">
              {t('table.selectionColumn', { zh: '选择', en: 'Selection' })}
            </span>
          )}
        </th>
      );
    }

    const column = renderColumn.column as TableColumn<T>;
    const columnKey = renderColumn.key;
    const sortable = Boolean(column.sortable);
    const order = sortState?.columnKey === columnKey ? sortState.order : null;
    const ariaSort =
      sortable && order
        ? order === 'ascend'
          ? 'ascending'
          : 'descending'
        : sortable
          ? 'none'
          : undefined;

    return (
      <th
        key={columnKey}
        scope="col"
        role="columnheader"
        aria-sort={ariaSort}
        data-slot="header-cell"
        data-key={columnKey}
        data-sortable={sortable || undefined}
        className={cx(
          'yuki-table__header-cell',
          `yuki-table__header-cell--${renderColumn.align}`,
          renderColumn.fixed && `yuki-table__header-cell--fixed-${renderColumn.fixed}`,
          classNames?.headerCell,
          column.className,
        )}
        style={{
          ...stickyStyle(renderColumn),
          width: renderColumn.width,
          minWidth: column.minWidth ?? renderColumn.width,
          textAlign: alignmentValue(renderColumn.align),
          ...styles?.headerCell,
        }}
      >
        <div
          data-slot="header-inner"
          className={cx('yuki-table__header-inner', classNames?.headerInner)}
          style={styles?.headerInner}
        >
          <span className="yuki-table__header-title">{column.title ?? columnKey}</span>
          {sortable && (
            <button
              type="button"
              data-slot="sort-trigger"
              data-active={order ? 'true' : undefined}
              aria-label={t('table.sortColumn', {
                zh: `排序 ${String(column.title ?? columnKey)}`,
                en: `Sort ${String(column.title ?? columnKey)}`,
              })}
              className={cx(
                'yuki-table__sort-trigger',
                order && 'yuki-table__sort-trigger--active',
                classNames?.sortTrigger,
              )}
              style={styles?.sortTrigger}
              onClick={() => toggleSort(columnKey, column)}
            >
              {renderSortIcon(columnKey, column)}
            </button>
          )}
          {column.filters != null && column.filters.length > 0 && (
            <Popover
              placement="bottom-start"
              content={
                <div
                  data-slot="filter-panel"
                  className={cx('yuki-table__filter-panel', classNames?.filterPanel)}
                  style={styles?.filterPanel}
                  // The popup is rendered in a portal but its React events still
                  // bubble to the Popover trigger; keep panel interactions from
                  // toggling the panel closed.
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="yuki-table__filter-options">
                    {column.filters.map((option) => {
                      const active = isOptionActive(columnKey, option.value);
                      return (
                        <button
                          key={String(option.value)}
                          type="button"
                          aria-pressed={active}
                          data-active={active || undefined}
                          data-slot="filter-option"
                          className={cx(
                            'yuki-table__filter-option',
                            active && 'yuki-table__filter-option--active',
                            classNames?.filterOption,
                          )}
                          style={styles?.filterOption}
                          onClick={() =>
                            toggleFilterOption(
                              columnKey,
                              option.value,
                              column.filterMultiple ?? true,
                            )
                          }
                        >
                          <span
                            aria-hidden="true"
                            data-slot="filter-check"
                            className={cx('yuki-table__filter-check', classNames?.filterCheck)}
                            style={styles?.filterCheck}
                          >
                            {active && (
                              <Icon name="check" size="var(--yuki-icon-size-xs)" />
                            )}
                          </span>
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    data-slot="filter-footer"
                    className={cx('yuki-table__filter-footer', classNames?.filterFooter)}
                    style={styles?.filterFooter}
                  >
                    <button
                      type="button"
                      data-slot="filter-reset"
                      className={cx('yuki-table__filter-reset', classNames?.filterReset)}
                      style={styles?.filterReset}
                      onClick={() => clearColumnFilter(columnKey)}
                    >
                      {t('common.clear', { zh: '清除', en: 'Clear' })}
                    </button>
                  </div>
                </div>
              }
            >
              <button
                type="button"
                data-slot="filter-trigger"
                data-active={
                  (filterState[columnKey]?.length ?? 0) > 0 ? 'true' : undefined
                }
                aria-label={t('table.filterColumn', {
                  zh: `筛选 ${String(column.title ?? columnKey)}`,
                  en: `Filter ${String(column.title ?? columnKey)}`,
                })}
                className={cx(
                  'yuki-table__filter-trigger',
                  (filterState[columnKey]?.length ?? 0) > 0 &&
                    'yuki-table__filter-trigger--active',
                  classNames?.filterTrigger,
                )}
                style={styles?.filterTrigger}
              >
                <Icon
                  name="chevron-down"
                  size="var(--yuki-icon-size-xs)"
                  className={classNames?.filterIcon}
                  style={styles?.filterIcon}
                />
              </button>
            </Popover>
          )}
        </div>
      </th>
    );
  };

  const renderSelectionControl = (
    row: T,
    rowIndex: number,
    key: TableKey,
    selected: boolean,
  ): ReactNode => {
    const checkboxProps = getCheckboxProps(row, rowIndex);
    const label = checkboxProps?.['aria-label'] ?? t('table.selectRow', { zh: '选择此行', en: 'Select row' });

    if ((rowSelection?.type ?? 'checkbox') === 'radio') {
      const control = (
        <input
          type="radio"
          data-slot="selection-radio"
          className={cx('yuki-table__radio', classNames?.selectionRadio)}
          style={styles?.selectionRadio}
          name={checkboxProps?.name ?? `yuki-table-radio-${radioGroupName}`}
          checked={selected}
          disabled={checkboxProps?.disabled}
          aria-label={label}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.checked) toggleRowSelected(key, true);
          }}
        />
      );
      return control;
    }

    const control = (
      <Checkbox
        checked={selected}
        disabled={checkboxProps?.disabled}
        name={checkboxProps?.name}
        aria-label={label}
        className={cx('yuki-table__selection-checkbox', classNames?.selectionCheckbox)}
        styles={styles?.selectionCheckbox ? { root: styles.selectionCheckbox } : undefined}
        onChange={(checked) => toggleRowSelected(key, checked)}
      />
    );

    return rowSelection?.renderCell
      ? rowSelection.renderCell({ row, rowIndex, selected, control })
      : control;
  };

  const renderCellContent = (
    row: T,
    rowIndex: number,
    renderColumn: RenderColumn<T>,
    key: TableKey,
  ): ReactNode => {
    if (renderColumn.kind === 'expand') {
      const canExpand = expandable?.rowExpandable?.(row) !== false;
      if (!canExpand) return null;
      const expanded = isExpanded(key);
      const toggle = () => toggleExpanded(key);
      if (expandable?.expandIcon) {
        return expandable.expandIcon({ expanded, row, rowIndex, toggle });
      }
      return (
        <button
          type="button"
          data-slot="expand-button"
          data-expanded={expanded || undefined}
          aria-expanded={expanded}
          aria-label={t(expanded ? 'table.collapseRow' : 'table.expandRow', {
            zh: expanded ? '收起' : '展开',
            en: expanded ? 'Collapse' : 'Expand',
          })}
          className={cx(
            'yuki-table__expand-button',
            expanded && 'yuki-table__expand-button--expanded',
            classNames?.expandButton,
          )}
          style={styles?.expandButton}
          onClick={toggle}
        >
          <Icon
            name="chevron-right"
            size="var(--yuki-icon-size-xs)"
            className={cx('yuki-table__expand-icon', classNames?.expandIcon)}
            style={styles?.expandIcon}
          />
        </button>
      );
    }

    if (renderColumn.kind === 'selection') {
      return renderSelectionControl(row, rowIndex, key, selectedSet.has(key));
    }

    const column = renderColumn.column as TableColumn<T>;
    const columnKey = renderColumn.key;
    const context: TableCellContext<T> = {
      row,
      rowIndex,
      column,
      columnKey,
      value: getCellValue(row, column.dataIndex),
    };
    if (column.render) return column.render(context);
    if (renderCell) return renderCell(context);
    return formatCellValue(context.value);
  };

  const renderRow = (row: T, rowIndex: number, key: TableKey): ReactNode => {
    const rowProps = onRow?.(row, rowIndex);
    const expanded = expansionEnabled && isExpanded(key);
    const selected = rowSelection ? selectedSet.has(key) : false;
    const extraRowClass =
      typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName;

    const rowNode = (
      <tr
        {...rowProps}
        key={key}
        role="row"
        data-row-key={String(key)}
        data-slot="row"
        data-selected={selected || undefined}
        data-expanded={expanded || undefined}
        aria-selected={rowSelection ? selected : undefined}
        className={cx(
          'yuki-table__row',
          striped && rowIndex % 2 === 1 && 'yuki-table__row--striped',
          hover && 'yuki-table__row--hover',
          selected && 'yuki-table__row--selected',
          virtualEnabled && 'yuki-table__row--virtual',
          classNames?.row,
          extraRowClass,
          rowProps?.className,
        )}
        style={{
          ...(virtualEnabled ? { height: resolvedRowHeight } : undefined),
          ...styles?.row,
          ...rowProps?.style,
        }}
      >
        {renderColumns.map((renderColumn) => {
          const isSticky = renderColumn.fixed != null;
          if (renderColumn.kind === 'expand') {
            return (
              <td
                key={renderColumn.key}
                role="cell"
                data-slot="expand-cell"
                className={cx(
                  'yuki-table__cell',
                  'yuki-table__cell--expand',
                  isSticky && `yuki-table__cell--fixed-${renderColumn.fixed}`,
                  classNames?.cell,
                  classNames?.expandCell,
                )}
                style={{ ...stickyStyle(renderColumn), width: renderColumn.width, ...styles?.expandCell }}
              >
                {renderCellContent(row, rowIndex, renderColumn, key)}
              </td>
            );
          }
          if (renderColumn.kind === 'selection') {
            return (
              <td
                key={renderColumn.key}
                role="cell"
                data-slot="selection-cell"
                className={cx(
                  'yuki-table__cell',
                  'yuki-table__cell--selection',
                  isSticky && `yuki-table__cell--fixed-${renderColumn.fixed}`,
                  classNames?.cell,
                  classNames?.selectionCell,
                )}
                style={{ ...stickyStyle(renderColumn), width: renderColumn.width, ...styles?.selectionCell }}
              >
                {renderCellContent(row, rowIndex, renderColumn, key)}
              </td>
            );
          }

          const column = renderColumn.column as TableColumn<T>;
          const ellipsis = Boolean(column.ellipsis);
          return (
            <td
              key={renderColumn.key}
              role="cell"
              data-slot="cell"
              data-key={renderColumn.key}
              className={cx(
                'yuki-table__cell',
                `yuki-table__cell--${renderColumn.align}`,
                ellipsis && 'yuki-table__cell--ellipsis',
                isSticky && `yuki-table__cell--fixed-${renderColumn.fixed}`,
                classNames?.cell,
                ellipsis && classNames?.cellEllipsis,
                column.className,
              )}
              style={{
                ...stickyStyle(renderColumn),
                textAlign: alignmentValue(renderColumn.align),
                ...(ellipsis ? { maxWidth: renderColumn.width } : undefined),
                ...styles?.cell,
                ...(ellipsis ? styles?.cellEllipsis : undefined),
              }}
              title={
                ellipsis && typeof getCellValue(row, column.dataIndex) === 'string'
                  ? (getCellValue(row, column.dataIndex) as string)
                  : undefined
              }
            >
              {renderCellContent(row, rowIndex, renderColumn, key)}
            </td>
          );
        })}
      </tr>
    );

    if (!expanded || !expandable) return rowNode;

    return (
      <>
        {rowNode}
        <tr
          key={`${String(key)}-expanded`}
          role="row"
          data-slot="expanded-row"
          className={cx(
            'yuki-table__row',
            'yuki-table__row--expanded',
            expandable.expandedRowClassName,
            classNames?.expandedRow,
          )}
          style={styles?.expandedRow}
        >
          <td
            role="cell"
            data-slot="expanded-cell"
            className={cx('yuki-table__cell', 'yuki-table__cell--expanded', classNames?.expandedCell)}
            style={styles?.expandedCell}
            colSpan={columnCount}
          >
            <div
              data-slot="expanded-content"
              className={cx('yuki-table__expanded-content', classNames?.expandedContent)}
              style={styles?.expandedContent}
            >
              {expandable.expandedRowRender(row, rowIndex)}
            </div>
          </td>
        </tr>
      </>
    );
  };

  const showEmpty = !loading && sortedRows.length === 0;

  const virtualStart = virtualEnabled
    ? (virtualizer.virtualItems[0]?.start ?? 0)
    : 0;
  const virtualEnd = virtualEnabled
    ? virtualizer.totalSize -
      (virtualizer.virtualItems[virtualizer.virtualItems.length - 1]?.end ?? 0)
    : 0;

  const renderRows = (): ReactNode[] => {
    const nodes: ReactNode[] = [];
    if (virtualEnabled && virtualStart > 0) {
      nodes.push(
        <tr key="__virtual-top" aria-hidden="true" className="yuki-table__spacer" data-slot="spacer">
          <td
            role="presentation"
            colSpan={columnCount}
            style={{ height: virtualStart, padding: 0, border: 0 }}
          />
        </tr>,
      );
    }
    const start = virtualEnabled ? virtualizer.range.start : 0;
    const end = virtualEnabled ? virtualizer.range.end : pagedRows.length - 1;
    for (let index = start; index <= end; index++) {
      const { row, key } = pagedRows[index]!;
      nodes.push(
        <Fragment key={`${typeof key}-${key}`}>
          {renderRow(row, index, key)}
        </Fragment>,
      );
    }
    if (virtualEnabled && virtualEnd > 0) {
      nodes.push(
        <tr key="__virtual-bottom" aria-hidden="true" className="yuki-table__spacer" data-slot="spacer">
          <td
            role="presentation"
            colSpan={columnCount}
            style={{ height: virtualEnd, padding: 0, border: 0 }}
          />
        </tr>,
      );
    }
    return nodes;
  };

  const showPagination = Boolean(
    paginationConfig && (total > pageSize || paginationConfig.showSizeChanger),
  );

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="table"
      data-size={size}
      data-bordered={bordered || undefined}
      data-striped={striped || undefined}
      data-loading={loading || undefined}
      data-virtual={virtualEnabled || undefined}
      data-empty={showEmpty || undefined}
      className={cx('yuki-table', `yuki-table--${size}`, classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      <div
        data-slot="content"
        className={cx('yuki-table__content', classNames?.content)}
        style={styles?.content}
      >
        <div
          ref={viewportRef}
          data-slot="container"
          className={cx('yuki-table__container', 'yuki-scrollbar', classNames?.container)}
          style={{
            maxHeight: scroll?.y,
            overflowX: scroll?.x != null ? 'auto' : undefined,
            ...styles?.container,
          }}
        >
          <table
            role="table"
            aria-busy={loading || undefined}
            data-slot="table"
            className={cx(
              'yuki-table__table',
              stickyHeader !== false && scroll?.y != null && 'yuki-table__table--sticky',
              classNames?.table,
            )}
            style={{
              minWidth: scroll?.x,
              ...styles?.table,
            }}
          >
            <colgroup data-slot="colgroup">
              {renderColumns.map((renderColumn) => (
                <col
                  key={renderColumn.key}
                  style={{ width: renderColumn.width, minWidth: renderColumn.width }}
                />
              ))}
            </colgroup>
            <thead
              data-slot="header"
              className={cx('yuki-table__header', classNames?.header)}
              style={styles?.header}
            >
              <tr
                role="row"
                data-slot="header-row"
                className={cx('yuki-table__header-row', classNames?.headerRow)}
                style={styles?.headerRow}
              >
                {renderColumns.map((renderColumn) => renderHeaderCell(renderColumn))}
              </tr>
            </thead>
            <tbody
              data-slot="body"
              className={cx('yuki-table__body', classNames?.body)}
              style={styles?.body}
            >
              {renderRows()}
              {showEmpty && (
                <tr role="row" data-slot="empty-row" className="yuki-table__empty-row">
                  <td
                    role="cell"
                    colSpan={columnCount}
                    data-slot="empty"
                    className={cx('yuki-table__empty', classNames?.empty)}
                    style={styles?.empty}
                  >
                    {(typeof empty === 'function' ? empty() : empty) ?? t('table.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div
            data-slot="loading"
            role="status"
            aria-live="polite"
            className={cx('yuki-table__loading', classNames?.loading)}
            style={styles?.loading}
          >
            <span
              aria-hidden="true"
              data-slot="spinner"
              className={cx('yuki-table__spinner', classNames?.spinner)}
              style={styles?.spinner}
            />
            <span className="yuki-visually-hidden">{t('table.loading')}</span>
          </div>
        )}
      </div>

      {footerRender && (
        <div
          data-slot="footer"
          className={cx('yuki-table__footer', classNames?.footer)}
          style={styles?.footer}
        >
          {footerRender(sortedRows.map(({ row }) => row))}
        </div>
      )}

      {showPagination && paginationConfig && (
        <div
          data-slot="pagination"
          className={cx('yuki-table__pagination', classNames?.pagination)}
          style={styles?.pagination}
        >
          <Pagination
            total={total}
            page={currentPage}
            pageSize={pageSize}
            pageSizeOptions={paginationConfig.pageSizeOptions}
            showSizeChanger={paginationConfig.showSizeChanger}
            showTotal={paginationConfig.showTotal ?? true}
            simple={paginationConfig.simple}
            size={size === 'lg' ? 'md' : size}
            onChange={changePage}
          />
        </div>
      )}
    </div>
  );
}

/**
 * A feature-complete data table: sorting, column filters, selection, expansion,
 * pagination, sticky/fixed columns and row virtualisation.
 */
const DataTable = forwardRef(TableInner) as <T>(
  props: TableProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

type TableComponent = {
  <T>(props: TableProps<T> & { ref?: Ref<HTMLDivElement> }): ReactElement;
  (props: CompoundTableProps & { ref?: Ref<HTMLTableElement> }): ReactElement;
};

/** Keep the existing data table and its ref intact, or compose native table sections. */
export const Table = forwardRef(function Table<T>(
  props: TableProps<T> | CompoundTableProps, ref: Ref<HTMLDivElement | HTMLTableElement>,
) {
  return 'columns' in props
    ? <DataTable {...props} ref={ref as Ref<HTMLDivElement>} />
    : <CompoundTable {...props} ref={ref as Ref<HTMLTableElement>} />;
}) as TableComponent;
