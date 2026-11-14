import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import { Input } from '../input';

/** Which list an item is moving to / from. */
export type TransferDirection = 'left' | 'right';

type TransferSide = 'left' | 'right';

/** Minimum shape of a transferable record. */
export interface TransferItem {
  key: string;
  title?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface TransferClassNames {
  root?: string;
  column?: string;
  header?: string;
  title?: string;
  count?: string;
  selectAll?: string;
  search?: string;
  body?: string;
  list?: string;
  item?: string;
  itemCheckbox?: string;
  itemLabel?: string;
  itemDescription?: string;
  empty?: string;
  operations?: string;
  operation?: string;
}

export interface TransferStyles {
  root?: StyleProperties;
  column?: StyleProperties;
  header?: StyleProperties;
  title?: StyleProperties;
  count?: StyleProperties;
  selectAll?: StyleProperties;
  search?: StyleProperties;
  body?: StyleProperties;
  list?: StyleProperties;
  item?: StyleProperties;
  itemCheckbox?: StyleProperties;
  itemLabel?: StyleProperties;
  itemDescription?: StyleProperties;
  empty?: StyleProperties;
  operations?: StyleProperties;
  operation?: StyleProperties;
}

export interface TransferProps<T extends TransferItem = TransferItem>
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'title'> {
  /** All transferable records, in display order. */
  dataSource: T[];
  /** Keys on the right (target) side — controlled. */
  targetKeys?: string[];
  /** Initial right-side keys when uncontrolled. */
  defaultTargetKeys?: string[];
  /** Fired with the next target keys, the move direction and the moved keys. */
  onChange?: (targetKeys: string[], direction: TransferDirection, movedKeys: string[]) => void;
  /** Column headers, `[source, target]`. */
  titles?: [ReactNode, ReactNode];
  /** Render a filter field above each list. */
  searchable?: boolean;
  /** Custom search predicate; defaults to a case-insensitive title / key match. */
  filterOption?: (input: string, item: T) => boolean;
  /** Show the select-all checkbox in each column header. */
  selectAll?: boolean;
  /** Custom row content. */
  renderItem?: (item: T) => ReactNode;
  disabled?: boolean;
  /** Extra keys that cannot be moved or selected. */
  disabledKeys?: string[];
  /** Hide the "move back to source" action. */
  oneWay?: boolean;
  /** Content shown when a list has no visible items. */
  emptyText?: ReactNode;
  size?: Size;
  classNames?: TransferClassNames;
  styles?: TransferStyles;
}

function defaultFilter<T extends TransferItem>(input: string, item: T): boolean {
  if (!input) return true;
  const label = typeof item.title === 'string' ? item.title : item.key;
  return label.toLowerCase().includes(input.trim().toLowerCase());
}

function labelOf<T extends TransferItem>(item: T): string {
  return typeof item.title === 'string' ? item.title : item.key;
}

function TransferInner<T extends TransferItem>(
  inputProps: TransferProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const {
    dataSource,
    targetKeys,
    defaultTargetKeys,
    onChange,
    titles,
    searchable = false,
    filterOption,
    selectAll = true,
    renderItem,
    disabled = false,
    disabledKeys,
    oneWay = false,
    emptyText,
    size: sizeProp,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Transfer', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();

  const [targets, setTargets] = useControllableState<string[]>({
    value: targetKeys,
    defaultValue: defaultTargetKeys ?? [],
  });

  const [selected, setSelected] = useState<Record<TransferSide, string[]>>({
    left: [],
    right: [],
  });
  const [search, setSearch] = useState<Record<TransferSide, string>>({ left: '', right: '' });
  const [activeKeys, setActiveKeys] = useState<Record<TransferSide, string | null>>({
    left: null,
    right: null,
  });

  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const typeahead = useRef('');
  const typeaheadTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (typeaheadTimer.current !== undefined) window.clearTimeout(typeaheadTimer.current);
    },
    [],
  );

  const targetSet = useMemo(() => new Set(targets), [targets]);
  const disabledSet = useMemo(() => new Set(disabledKeys ?? []), [disabledKeys]);

  const isItemDisabled = useCallback(
    (item: T) => disabled || item.disabled === true || disabledSet.has(item.key),
    [disabled, disabledSet],
  );

  const leftItems = useMemo(
    () => dataSource.filter((item) => !targetSet.has(item.key)),
    [dataSource, targetSet],
  );
  const rightItems = useMemo(
    () => dataSource.filter((item) => targetSet.has(item.key)),
    [dataSource, targetSet],
  );

  const visible: Record<TransferSide, T[]> = useMemo(() => {
    const match = filterOption ?? ((query: string, item: T) => defaultFilter(query, item));
    const filter = (items: T[], query: string) =>
      query ? items.filter((item) => match(query, item)) : items;
    return { left: filter(leftItems, search.left), right: filter(rightItems, search.right) };
  }, [filterOption, leftItems, rightItems, search]);

  const toggleItem = useCallback((side: TransferSide, key: string) => {
    setSelected((prev) => {
      const keys = prev[side];
      return {
        ...prev,
        [side]: keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key],
      };
    });
  }, []);

  const toggleAll = useCallback(
    (side: TransferSide) => {
      const enabledKeys = visible[side]
        .filter((item) => !isItemDisabled(item))
        .map((item) => item.key);
      setSelected((prev) => {
        const keys = prev[side];
        const allSelected = enabledKeys.length > 0 && enabledKeys.every((key) => keys.includes(key));
        return {
          ...prev,
          [side]: allSelected
            ? keys.filter((key) => !enabledKeys.includes(key))
            : Array.from(new Set([...keys, ...enabledKeys])),
        };
      });
    },
    [isItemDisabled, visible],
  );

  const move = useCallback(
    (direction: TransferDirection, keys: string[]) => {
      if (disabled) return;
      const movable = keys.filter((key) => {
        const item = dataSource.find((candidate) => candidate.key === key);
        return item !== undefined && !isItemDisabled(item);
      });
      if (movable.length === 0) return;
      const next =
        direction === 'right'
          ? [...targets, ...movable]
          : targets.filter((key) => !movable.includes(key));
      setTargets(next);
      onChange?.(next, direction, movable);
      const source: TransferSide = direction === 'right' ? 'left' : 'right';
      setSelected((prev) => ({
        ...prev,
        [source]: prev[source].filter((key) => !movable.includes(key)),
      }));
    },
    [dataSource, disabled, isItemDisabled, onChange, setTargets, targets],
  );

  const handleItemKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    side: TransferSide,
    item: T,
  ) => {
    const enabled = visible[side].filter((candidate) => !isItemDisabled(candidate));
    const index = enabled.findIndex((candidate) => candidate.key === item.key);
    if (index < 0) return;

    const focusKey = (key: string) => {
      setActiveKeys((prev) => ({ ...prev, [side]: key }));
      itemRefs.current.get(`${side}:${key}`)?.focus();
    };

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = enabled[index + 1];
        if (next) focusKey(next.key);
        return;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const previous = enabled[index - 1];
        if (previous) focusKey(previous.key);
        return;
      }
      case 'Home': {
        event.preventDefault();
        const first = enabled[0];
        if (first) focusKey(first.key);
        return;
      }
      case 'End': {
        event.preventDefault();
        const last = enabled[enabled.length - 1];
        if (last) focusKey(last.key);
        return;
      }
      case ' ':
      case 'Spacebar':
      case 'Enter':
        event.preventDefault();
        toggleItem(side, item.key);
        setActiveKeys((prev) => ({ ...prev, [side]: item.key }));
        return;
      default:
        break;
    }

    if (event.key.length === 1 && event.key !== ' ') {
      typeahead.current += event.key.toLowerCase();
      if (typeaheadTimer.current !== undefined) window.clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = window.setTimeout(() => {
        typeahead.current = '';
      }, 500);
      const query = typeahead.current;
      const start = query.length === 1 ? index + 1 : index;
      const ordered = [...enabled.slice(start), ...enabled.slice(0, start)];
      const match = ordered.find((candidate) =>
        labelOf(candidate).toLowerCase().startsWith(query),
      );
      if (match) focusKey(match.key);
      else if (query.length > 1) typeahead.current = '';
    }
  };

  const columnTitle = (side: TransferSide): ReactNode => {
    const [sourceTitle, targetTitle] = titles ?? [
      t('transfer.sourceTitle', { zh: '待选列表', en: 'Source' }),
      t('transfer.targetTitle', { zh: '已选列表', en: 'Target' }),
    ];
    return side === 'left' ? sourceTitle : targetTitle;
  };

  const columnAriaLabel = (side: TransferSide): string => {
    const title = columnTitle(side);
    if (typeof title === 'string') return title;
    return side === 'left'
      ? t('transfer.sourceTitle', { zh: '待选列表', en: 'Source' })
      : t('transfer.targetTitle', { zh: '已选列表', en: 'Target' });
  };

  const renderColumn = (side: TransferSide) => {
    const items = visible[side];
    const enabledItems = items.filter((item) => !isItemDisabled(item));
    const selectedKeys = selected[side].filter((key) =>
      items.some((item) => item.key === key),
    );
    const allSelected =
      enabledItems.length > 0 && enabledItems.every((item) => selectedKeys.includes(item.key));
    const someSelected = !allSelected && selectedKeys.length > 0;
    const firstEnabled = enabledItems[0]?.key;
    const selectAllLabel = `${t('transfer.selectAll', { zh: '全选', en: 'Select all' })} ${columnAriaLabel(side)}`;

    return (
      <section
        key={side}
        data-slot="column"
        data-side={side}
        className={cx('yuki-transfer__column', classNames?.column)}
        style={styles?.column}
      >
        <header
          data-slot="header"
          className={cx('yuki-transfer__header', classNames?.header)}
          style={styles?.header}
        >
          {selectAll && (
            <span
              data-slot="select-all"
              className={cx('yuki-transfer__select-all', classNames?.selectAll)}
              style={styles?.selectAll}
            >
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                disabled={disabled || enabledItems.length === 0}
                size={size}
                aria-label={selectAllLabel}
                onChange={() => toggleAll(side)}
              />
            </span>
          )}
          <span
            data-slot="title"
            className={cx('yuki-transfer__title', classNames?.title)}
            style={styles?.title}
          >
            {columnTitle(side)}
          </span>
          <span
            data-slot="count"
            className={cx('yuki-transfer__count', classNames?.count)}
            style={styles?.count}
          >
            {items.length}
          </span>
        </header>

        {searchable && (
          <div
            data-slot="search"
            className={cx('yuki-transfer__search', classNames?.search)}
            style={styles?.search}
          >
            <Input
              size={size}
              value={search[side]}
              placeholder={t('transfer.searchPlaceholder', { zh: '搜索', en: 'Search' })}
              aria-label={t('transfer.searchLabel', { zh: '搜索列表', en: 'Search list' })}
              prefix={<Icon name="search" />}
              allowClear
              disabled={disabled}
              onChange={(value) => setSearch((prev) => ({ ...prev, [side]: value }))}
            />
          </div>
        )}

        <div
          data-slot="body"
          className={cx('yuki-transfer__body', classNames?.body)}
          style={styles?.body}
        >
          {items.length === 0 ? (
            <div
              data-slot="empty"
              className={cx('yuki-transfer__empty', classNames?.empty)}
              style={styles?.empty}
            >
              {emptyText ?? t('transfer.empty', { zh: '暂无数据', en: 'No data' })}
            </div>
          ) : (
            <ul
              data-slot="list"
              className={cx('yuki-transfer__list', classNames?.list)}
              style={styles?.list}
              role="listbox"
              aria-multiselectable="true"
              aria-label={columnAriaLabel(side)}
            >
              {items.map((item) => {
                const label = renderItem ? renderItem(item) : (item.title ?? item.key);
                const itemDisabled = isItemDisabled(item);
                const isSelected = selectedKeys.includes(item.key);
                const activeKey = activeKeys[side] ?? firstEnabled;

                return (
                  <li
                    key={item.key}
                    ref={(element) => {
                      const mapKey = `${side}:${item.key}`;
                      if (element) itemRefs.current.set(mapKey, element);
                      else itemRefs.current.delete(mapKey);
                    }}
                    data-slot="item"
                    data-selected={isSelected || undefined}
                    data-disabled={itemDisabled || undefined}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={itemDisabled || undefined}
                    tabIndex={itemDisabled ? -1 : activeKey === item.key ? 0 : -1}
                    className={cx(
                      'yuki-transfer__item',
                      isSelected && 'yuki-transfer__item--selected',
                      itemDisabled && 'yuki-transfer__item--disabled',
                      classNames?.item,
                    )}
                    style={styles?.item}
                    onClick={() => {
                      if (!itemDisabled) toggleItem(side, item.key);
                    }}
                    onKeyDown={(event) => handleItemKeyDown(event, side, item)}
                  >
                    <span
                      data-slot="item-checkbox"
                      aria-hidden="true"
                      className={cx('yuki-transfer__item-checkbox', classNames?.itemCheckbox)}
                      style={styles?.itemCheckbox}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={itemDisabled}
                        size={size}
                        tabIndex={-1}
                        onChange={() => toggleItem(side, item.key)}
                      />
                    </span>
                    <span
                      data-slot="item-label"
                      title={typeof label === 'string' ? label : undefined}
                      className={cx('yuki-transfer__item-label', classNames?.itemLabel)}
                      style={styles?.itemLabel}
                    >
                      {label}
                    </span>
                    {item.description !== undefined && (
                      <span
                        data-slot="item-description"
                        title={typeof item.description === 'string' ? item.description : undefined}
                        className={cx(
                          'yuki-transfer__item-description',
                          classNames?.itemDescription,
                        )}
                        style={styles?.itemDescription}
                      >
                        {item.description}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    );
  };

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="transfer"
      data-size={size}
      data-disabled={disabled || undefined}
      className={cx('yuki-transfer', `yuki-transfer--${size}`, classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
    >
      {renderColumn('left')}

      <div
        data-slot="operations"
        className={cx('yuki-transfer__operations', classNames?.operations)}
        style={styles?.operations}
      >
        <span
          data-slot="operation"
          data-direction="right"
          className={cx('yuki-transfer__operation', classNames?.operation)}
          style={styles?.operation}
        >
          <Button
            size={size}
            variant="soft"
            startIcon={<Icon name="arrow-right" />}
            aria-label={t('transfer.moveRight', { zh: '移动到右侧', en: 'Move to right' })}
            disabled={disabled || selected.left.length === 0}
            onClick={() => move('right', selected.left)}
          />
        </span>
        {!oneWay && (
          <span
            data-slot="operation"
            data-direction="left"
            className={cx('yuki-transfer__operation', classNames?.operation)}
            style={styles?.operation}
          >
            <Button
              size={size}
              variant="soft"
              startIcon={<Icon name="arrow-left" />}
              aria-label={t('transfer.moveLeft', { zh: '移动到左侧', en: 'Move to left' })}
              disabled={disabled || selected.right.length === 0}
              onClick={() => move('left', selected.right)}
            />
          </span>
        )}
      </div>

      {renderColumn('right')}
    </div>
  );
}

/**
 * Move records between two lists. Pass `targetKeys` for controlled mode and
 * `dataSource` as the single source of truth for both columns.
 */
export const Transfer = forwardRef(TransferInner) as <T extends TransferItem = TransferItem>(
  props: TransferProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
