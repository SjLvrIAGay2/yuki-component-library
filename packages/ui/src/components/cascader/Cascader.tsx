import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  useId,
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
import { Popup } from '../../internal/Popup';
import {
  useClickOutside,
  useControllableState,
  useEscapeKey,
  useMergedRefs,
} from '../../hooks';
import type { Placement } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { useFieldControl } from '../form/context';
import { SelectPanelStatus, SelectTrigger } from '../select/select-shared';
import {
  firstEnabledIndex,
  lastEnabledIndex,
  type SelectStatus,
} from '../select/select-utils';
import {
  filterCascaderLeaves,
  findCascaderNodes,
  flattenCascaderLeaves,
  isLeafOption,
  type CascaderLeaf,
  type CascaderOption,
  type CascaderValue,
} from './cascader-utils';

export interface CascaderOptionRenderState {
  depth: number;
  active: boolean;
  selected: boolean;
  disabled: boolean;
  expandable: boolean;
}

export interface CascaderClassNames {
  root?: string;
  trigger?: string;
  panel?: string;
  columns?: string;
  column?: string;
  option?: string;
  optionLabel?: string;
  optionCheck?: string;
  search?: string;
  searchInput?: string;
  status?: string;
  value?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  clear?: string;
  arrow?: string;
}

export interface CascaderStyles {
  root?: StyleProperties;
  trigger?: StyleProperties;
  panel?: StyleProperties;
  columns?: StyleProperties;
}

export interface CascaderProps<T = string>
  extends Omit<
    WithStyle<HTMLAttributes<HTMLDivElement>>,
    'onChange' | 'defaultValue' | 'value' | 'prefix'
  > {
  options: readonly CascaderOption<T>[];
  value?: CascaderValue<T> | null;
  defaultValue?: CascaderValue<T> | null;
  onChange?: (
    value: CascaderValue<T> | null,
    selectedOptions: CascaderOption<T>[],
  ) => void;
  onClear?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: Size;
  placeholder?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  status?: SelectStatus;
  clearable?: boolean;
  /** Commit intermediate levels instead of requiring a leaf. */
  changeOnSelect?: boolean;
  searchable?: boolean;
  filterOption?: (query: string, leaf: CascaderLeaf<T>) => boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  /** Custom trigger value renderer receiving the selected labels in order. */
  displayRender?: (
    labels: ReactNode[],
    selectedOptions: CascaderOption<T>[],
  ) => ReactNode;
  /** Custom option renderer for the column lists. */
  renderOption?: (option: CascaderOption<T>, state: CascaderOptionRenderState) => ReactNode;
  showArrow?: boolean;
  borderless?: boolean;
  placement?: Placement;
  name?: string;
  required?: boolean;
  classNames?: CascaderClassNames;
  styles?: CascaderStyles;
}

function CascaderInner<T = string>(
  inputProps: CascaderProps<T>,
  forwardedRef: Ref<HTMLDivElement>,
) {
  const {
    options,
    value: valueProp,
    defaultValue = null,
    onChange,
    onClear,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    size: sizeProp,
    placeholder,
    disabled: disabledProp,
    readOnly = false,
    invalid: invalidProp,
    status: statusProp,
    clearable = false,
    changeOnSelect = false,
    searchable = false,
    filterOption,
    onSearch,
    searchPlaceholder,
    emptyText,
    displayRender,
    renderOption,
    showArrow = true,
    borderless = false,
    placement = 'bottom',
    name,
    required: requiredProp,
    classNames,
    styles,
    className,
    style,
    id,
    onKeyDown,
    ...rest
  } = useComponentDefaults('Cascader', inputProps);
  const field = useFieldControl<CascaderValue<T> | null>({ id, value: valueProp, disabled: disabledProp, status: statusProp });
  const disabled = field.disabled;
  const status = field.status === 'default' ? undefined : field.status;
  const required = requiredProp || field.required;
  const invalid = invalidProp || status === 'error';
  const interactive = !disabled && !readOnly && !rest.hidden;
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mergedRootRef = useMergedRefs(rootRef, forwardedRef);
  const columnRefs = useRef<Array<HTMLUListElement | null>>([]);

  const [requestedOpen, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = requestedOpen && interactive;
  const [value, setValue] = useControllableState<CascaderValue<T> | null>({
    value: field.bound ? (field.value ?? null) : valueProp,
    defaultValue,
    onChange: (next) => {
      const nodes = next ? findCascaderNodes(options, next) : [];
      onChange?.(next, nodes);
      field.onChange?.(next);
    },
  });

  const [activePath, setActivePath] = useState<readonly T[]>(() => value ?? []);
  const [hoverPath, setHoverPath] = useState<readonly T[]>(() => value ?? []);
  const [search, setSearch] = useState('');
  const [focusDepth, setFocusDepth] = useState<number | null>(null);

  const searching = searchable && search.trim().length > 0;
  const leaves = useMemo(() => searching ? flattenCascaderLeaves(options) : [], [searching, options]);
  const searchResults = useMemo(
    () => filterCascaderLeaves(leaves, search, filterOption),
    [leaves, search, filterOption],
  );

  const selectedNodes = useMemo(
    () => (value && value.length > 0 ? findCascaderNodes(options, value) : []),
    [options, value],
  );
  const selectedLabels = selectedNodes.map((node) => node.label);
  const hasValue = value != null && value.length > 0;

  const close = () => setOpen(false);

  const openPanel = () => {
    if (!interactive) return;
    const initial = value ?? [];
    setActivePath(initial);
    setHoverPath(initial);
    setSearch('');
    setOpen(true);
  };

  const commit = (path: readonly T[]) => {
    const next = path.length === 0 ? null : [...path];
    setValue(next);
    setHoverPath(next ?? []);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const clearValue = () => {
    if (!interactive) return;
    setValue(null);
    onClear?.();
    close();
    triggerRef.current?.focus();
  };

  // Focus the requested column after it renders.
  useEffect(() => {
    if (!open || focusDepth == null) return;
    const timer = window.setTimeout(() => {
      columnRefs.current[focusDepth]?.focus({ preventScroll: true });
      setFocusDepth(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, focusDepth]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      if (searchable) searchRef.current?.focus({ preventScroll: true });
      else columnRefs.current[0]?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, searchable]);

  useEffect(() => {
    if (!interactive && requestedOpen) setOpen(false);
  }, [interactive, requestedOpen, setOpen]);

  useClickOutside([rootRef, panelRef], close, open);
  useEscapeKey(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, open);

  const expandActive = (path: readonly T[]) => {
    setActivePath(path);
    setHoverPath(path);
  };

  const selectOption = (option: CascaderOption<T>, index: number) => {
    if (!interactive || option.disabled) return;
    const parentPath = activePath.slice(0, index);
    const nextPath = [...parentPath, option.value];
    if (isLeafOption(option)) {
      commit(nextPath);
      return;
    }
    expandActive(nextPath);
    if (changeOnSelect) {
      setValue(nextPath);
      setActivePath(nextPath);
    }
    setFocusDepth(index + 1);
  };

  const moveHover = (depthIndex: number, option: CascaderOption<T>) => {
    setHoverPath((current) => {
      const base = current.length > depthIndex ? current.slice(0, depthIndex) : activePath.slice(0, depthIndex);
      return [...base, option.value];
    });
  };

  const onColumnKeyDown = (
    event: KeyboardEvent<HTMLUListElement>,
    depthIndex: number,
    columnOptions: readonly CascaderOption<T>[],
    activeIndex: number,
  ) => {
    const current = columnOptions[activeIndex];
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const forward = event.key === 'ArrowDown';
        let nextIndex = activeIndex;
        for (let step = 1; step <= columnOptions.length; step += 1) {
          const candidate =
            (activeIndex + (forward ? step : -step) + columnOptions.length) %
            columnOptions.length;
          const option = columnOptions[candidate];
          if (option && !option.disabled) {
            nextIndex = candidate;
            break;
          }
        }
        const target = columnOptions[nextIndex];
        if (target) moveHover(depthIndex, target);
        break;
      }
      case 'Home': {
        event.preventDefault();
        const target = columnOptions[firstEnabledIndex(columnOptions)];
        if (target) moveHover(depthIndex, target);
        break;
      }
      case 'End': {
        event.preventDefault();
        const target = columnOptions[lastEnabledIndex(columnOptions)];
        if (target) moveHover(depthIndex, target);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (current && !current.disabled && !isLeafOption(current)) {
          const nextPath = activePath.slice(0, depthIndex).concat(current.value);
          expandActive(nextPath);
          setFocusDepth(depthIndex + 1);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (depthIndex > 0) {
          setActivePath(activePath.slice(0, depthIndex));
          setFocusDepth(depthIndex - 1);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!current || current.disabled) return;
        const parentPath = activePath.slice(0, depthIndex);
        const nextPath = [...parentPath, current.value];
        if (isLeafOption(current)) commit(nextPath);
        else {
          expandActive(nextPath);
          if (changeOnSelect) setValue(nextPath);
          setFocusDepth(depthIndex + 1);
        }
        break;
      }
      default:
        break;
    }
  };

  const triggerLabel = hasValue
    ? displayRender
      ? displayRender(selectedLabels, selectedNodes)
      : selectedLabels.map((label, index) => (
          <span key={index} data-slot="value-label">
            {label}
            {index < selectedLabels.length - 1 && (
              <span aria-hidden="true" className="yuki-cascader__separator">
                {' / '}
              </span>
            )}
          </span>
        ))
    : null;

  const emptyNode = (
    <SelectPanelStatus className={cx(classNames?.status)}>
      {emptyText ?? t('common.noData', { zh: '暂无数据', en: 'No data' })}
    </SelectPanelStatus>
  );

  const renderColumn = (
    columnOptions: readonly CascaderOption<T>[],
    depthIndex: number,
    activeValue: T | undefined,
  ) => {
    let activeIndex = columnOptions.findIndex((option) => !option.disabled && Object.is(option.value, activeValue));
    if (activeIndex < 0) activeIndex = firstEnabledIndex(columnOptions);
    const listId = `${baseId}-col-${depthIndex}`;
    return (
      <ul
        key={depthIndex}
        ref={(node) => {
          columnRefs.current[depthIndex] = node;
        }}
        id={listId}
        role="listbox"
        aria-label={t('cascader.level', { zh: `第 ${depthIndex + 1} 级选项`, en: `Level ${depthIndex + 1}` })}
        tabIndex={0}
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        data-slot="column"
        className={cx('yuki-cascader__column', classNames?.column)}
        onKeyDown={(event) => onColumnKeyDown(event, depthIndex, columnOptions, activeIndex)}
      >
        {columnOptions.map((option, index) => {
          const isActive = index === activeIndex;
          const isSelected =
            value != null && Object.is(option.value, value[depthIndex]) &&
            activePath.slice(0, depthIndex).every((ancestor, i) => Object.is(ancestor, value[i]));
          const expandable = !isLeafOption(option);
          const optionId = `${listId}-option-${index}`;
          return (
            <li
              key={optionId}
              id={optionId}
              role="option"
              data-slot="option"
              data-value={String(option.value)}
              aria-selected={isSelected}
              aria-disabled={option.disabled || undefined}
              className={cx(
                'yuki-cascader__option',
                isActive && 'yuki-cascader__option--active',
                isSelected && 'yuki-cascader__option--selected',
                option.disabled && 'yuki-cascader__option--disabled',
                classNames?.option,
              )}
              onMouseEnter={() => {
                if (!option.disabled) moveHover(depthIndex, option);
              }}
              onClick={() => selectOption(option, depthIndex)}
            >
              {renderOption ? (
                renderOption(option, {
                  depth: depthIndex,
                  active: isActive,
                  selected: isSelected,
                  disabled: Boolean(option.disabled),
                  expandable,
                })
              ) : (
                <>
                  <span
                    data-slot="option-label"
                    className={cx('yuki-cascader__option-label', classNames?.optionLabel)}
                  >
                    {option.label}
                  </span>
                  {expandable && (
                    <span aria-hidden="true" className="yuki-cascader__option-expand">
                      <Icon name="chevron-right" size="1em" />
                    </span>
                  )}
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className={cx('yuki-cascader__option-check', classNames?.optionCheck)}
                    >
                      <Icon name="check" size="1em" />
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const columns: ReactNode[] = [];
  {
    let level: readonly CascaderOption<T>[] = options;
    for (let index = 0; index <= activePath.length; index += 1) {
      if (level.length === 0) break;
      columns.push(renderColumn(level, index, hoverPath[index]));
      const nextValue = activePath[index];
      const node = nextValue === undefined ? undefined : level.find((option) => Object.is(option.value, nextValue));
      if (!node || node.disabled || isLeafOption(node)) break;
      level = node.children ?? [];
    }
  }

  const selectableResults = searchResults.filter((leaf) => !leaf.nodes.some((node) => node.disabled));
  const searchActiveIndex = Math.max(0, selectableResults.findIndex((leaf) =>
    leaf.path.length === hoverPath.length && leaf.path.every((value, i) => Object.is(value, hoverPath[i])),
  ));
  const activeResult = selectableResults[searchActiveIndex];
  const resultsId = `${baseId}-results`;

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (!searching) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        event.preventDefault();
        columnRefs.current[0]?.focus();
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = selectableResults[Math.max(0, Math.min(selectableResults.length - 1, searchActiveIndex + delta))];
      if (next) setHoverPath(next.path);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeResult) commit(activeResult.path);
    }
  };

  return (
    <div
      ref={mergedRootRef}
      hidden={rest.hidden}
      data-slot="cascader"
      data-size={size}
      data-open={open ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      data-status={status}
      data-value={hasValue ? value?.map((item) => String(item)).join('/') : undefined}
      className={cx('yuki-select-root', 'yuki-cascader', className, classNames?.root)}
      style={{ ...style, ...styles?.root }}
    >
      {name != null && (
        <input
          type="hidden"
          name={name}
          value={hasValue ? value?.map((item) => String(item)).join(',') : ''}
          disabled={disabled}
          required={required}
        />
      )}
      <SelectTrigger
        {...rest}
        ref={triggerRef}
        {...field.ariaProps}
        id={field.id ?? `${baseId}-trigger`}
        aria-labelledby={rest['aria-labelledby'] ?? field.labelId}
        aria-describedby={[rest['aria-describedby'], field.ariaProps['aria-describedby']].filter(Boolean).join(' ') || undefined}
        aria-invalid={invalid || rest['aria-invalid']}
        aria-controls={open ? `${baseId}-dialog` : undefined}
        role="combobox"
        open={open}
        size={size}
        disabled={disabled}
        invalid={invalid}
        status={status}
        borderless={borderless}
        placeholder={placeholder ?? t('cascader.placeholder', { zh: '请选择', en: 'Select' })}
        value={triggerLabel}
        hasValue={hasValue}
        showArrow={showArrow}
        clearable={clearable && !readOnly}
        onClear={clearValue}
        clearLabel={t('common.clear', { zh: '清除', en: 'Clear' })}
        aria-haspopup="dialog"
        aria-required={required || undefined}
        aria-readonly={readOnly || undefined}
        className={cx('yuki-cascader__trigger', classNames?.trigger)}
        classNames={{
          value: classNames?.value,
          placeholder: classNames?.placeholder,
          prefix: classNames?.prefix,
          suffix: classNames?.suffix,
          clear: classNames?.clear,
          arrow: classNames?.arrow,
        }}
        style={styles?.trigger}
        onBlur={(event) => {
          rest.onBlur?.(event);
          field.onBlur?.();
        }}
        onClick={(event) => {
          rest.onClick?.(event);
          if (event.defaultPrevented || !interactive) return;
          if (open) close();
          else openPanel();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !interactive) return;
          if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openPanel();
          } else if (open && event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
          }
        }}
      />
      <Popup
        id={`${baseId}-dialog`}
        open={open}
        anchorRef={triggerRef}
        placement={placement}
        role="dialog"
        aria-label={t('cascader.dialog', { zh: '选择选项', en: 'Choose option' })}
      >
        <div
          ref={panelRef}
          data-slot="panel"
          className={cx('yuki-cascader__panel', classNames?.panel)}
          style={styles?.panel}
        >
          {searchable && (
            <div data-slot="search" className={cx('yuki-cascader__search', classNames?.search)}>
              <Icon name="search" size="1em" />
              <input
                ref={searchRef}
                type="text"
                role="textbox"
                aria-label={searchPlaceholder ?? t('common.search', { zh: '搜索选项', en: 'Search options' })}
                placeholder={searchPlaceholder ?? t('common.search', { zh: '搜索', en: 'Search' })}
                aria-controls={searching && searchResults.length ? resultsId : undefined}
                aria-activedescendant={activeResult ? `${resultsId}-${searchResults.indexOf(activeResult)}` : undefined}
                value={search}
                disabled={disabled}
                className={cx('yuki-cascader__search-input', classNames?.searchInput)}
                onChange={(event) => {
                  setSearch(event.target.value);
                  onSearch?.(event.target.value);
                }}
                onKeyDown={onSearchKeyDown}
              />
            </div>
          )}
          {searching ? (
            searchResults.length === 0 ? (
              emptyNode
            ) : (
              <ul
                id={resultsId}
                role="listbox"
                aria-label={t('cascader.searchResults', { zh: '搜索结果', en: 'Search results' })}
                data-slot="results"
                className={cx('yuki-cascader__results', classNames?.columns)}
              >
                {searchResults.map((leaf, index) => {
                  const isActive = leaf === activeResult;
                  const disabledPath = leaf.nodes.some((node) => node.disabled);
                  const isSelected =
                    value != null && leaf.path.length === value.length && leaf.path.every((item, i) => Object.is(item, value[i]));
                  return (
                    <li
                      key={index}
                      id={`${resultsId}-${index}`}
                      aria-disabled={disabledPath || undefined}
                      role="option"
                      data-slot="option"
                      aria-selected={isSelected}
                      className={cx(
                        'yuki-cascader__option',
                        'yuki-cascader__result',
                        disabledPath && 'yuki-cascader__option--disabled',
                        isActive && 'yuki-cascader__option--active',
                        isSelected && 'yuki-cascader__option--selected',
                        classNames?.option,
                      )}
                      onMouseEnter={() => { if (!disabledPath) setHoverPath(leaf.path); }}
                      onClick={() => { if (!disabledPath) commit(leaf.path); }}
                    >
                      <span className="yuki-cascader__option-label">
                        {leaf.labels.map((label, labelIndex) => (
                          <span key={labelIndex}>
                            {label}
                            {labelIndex < leaf.labels.length - 1 && (
                              <span aria-hidden="true" className="yuki-cascader__separator">
                                {' / '}
                              </span>
                            )}
                          </span>
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )
          ) : options.length === 0 || columns.length === 0 ? (
            emptyNode
          ) : (
            <div
              data-slot="columns"
              className={cx('yuki-cascader__columns', classNames?.columns)}
              style={styles?.columns}
            >
              {columns}
            </div>
          )}
        </div>
      </Popup>
    </div>
  );
}

/**
 * Cascader with one listbox column per depth level, typeahead search across
 * leaf paths and full keyboard traversal (arrows + Enter to expand/commit).
 */
export const Cascader = forwardRef(CascaderInner) as <T = string>(
  props: CascaderProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

(Cascader as { displayName?: string }).displayName = 'Cascader';

export default Cascader;

export type { CascaderOption, CascaderValue, CascaderLeaf };
