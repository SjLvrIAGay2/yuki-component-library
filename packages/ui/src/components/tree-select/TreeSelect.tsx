import { useAnimation, usePresence, type AnimationOptions } from '../../animation';
import { inertValue } from '../../internal/inert';
import { mergeProps } from '../../internal/merge-props';
import {
  StandaloneField,
  useStandaloneField,
  fieldDescription,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import { useFieldControl } from '../form/context';
import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { createTypeahead, isPrintableKey } from '../../internal/keyboard';
import { Popup } from '../../internal/Popup';
import { useClickOutside, useControllableState, useEscapeKey, useMergedRefs } from '../../hooks';
import type { Placement } from '../../hooks';
import { useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { type SelectStatus } from '../select/select-utils';
import { SelectPanelStatus, SelectTag, SelectTrigger, getOptionId } from '../select/select-shared';
import {
  collectExpandableKeys,
  filterTreeNodes,
  findRowIndex,
  findTreeNode,
  firstEnabledRow,
  flattenVisibleTree,
  getAncestorKeys,
  hasTreeChildren,
  lastEnabledRow,
  nextEnabledRow,
  treeNodeText,
  typeaheadRow,
  type TreeNodeOption,
  type TreeRow,
} from './tree-utils';

const EMPTY_KEYS: readonly never[] = [];
const EMPTY_VALUES: readonly never[] = [];

export type TreeSelectValue<T> = T | readonly T[] | null;

export interface TreeSelectClassNames {
  root?: string;
  trigger?: string;
  panel?: string;
  search?: string;
  searchInput?: string;
  tree?: string;
  node?: string;
  nodeContent?: string;
  nodeLabel?: string;
  nodeToggle?: string;
  nodeCheckbox?: string;
  empty?: string;
  tags?: string;
  tag?: string;
  tagLabel?: string;
  tagRemove?: string;
  value?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  clear?: string;
  arrow?: string;
}

export interface TreeSelectStyles {
  root?: CSSProperties;
  trigger?: CSSProperties;
  panel?: CSSProperties;
  tree?: CSSProperties;
}

export interface TreeSelectNodeState {
  depth: number;
  expanded: boolean;
  selected: boolean;
  active: boolean;
  disabled: boolean;
  leaf: boolean;
}

interface TreeSelectCommonProps<T>
  extends
    StandaloneFieldProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
  options: readonly TreeNodeOption<T>[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: Size;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  status?: SelectStatus;
  clearable?: boolean;
  onClear?: () => void;
  searchable?: boolean;
  filterTreeNode?: (query: string, node: TreeNodeOption<T>) => boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: readonly T[];
  expandedKeys?: readonly T[];
  onExpandedChange?: (keys: readonly T[]) => void;
  maxTagCount?: number;
  maxTagPlaceholder?: (hidden: readonly TreeNodeOption<T>[]) => ReactNode;
  removeLabel?: (node: TreeNodeOption<T>) => string;
  /** Disable descendants of disabled branches as well. */
  inheritDisabled?: boolean;
  animation?: AnimationOptions | false;
  icon?: ReactNode;
  indicator?: ReactNode;
  triggerProps?: HTMLAttributes<HTMLDivElement>;
  contentProps?: HTMLAttributes<HTMLDivElement>;
  valueProps?: HTMLAttributes<HTMLSpanElement>;
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  optionProps?: (node: TreeNodeOption<T>, index: number) => HTMLAttributes<HTMLDivElement>;
  portalContainer?: HTMLElement | null;
  forceMount?: boolean;
  renderNode?: (node: TreeNodeOption<T>, state: TreeSelectNodeState) => ReactNode;
  showArrow?: boolean;
  borderless?: boolean;
  placement?: Placement;
  name?: string;
  required?: boolean;
  classNames?: TreeSelectClassNames;
  styles?: TreeSelectStyles;
}

export type TreeSelectProps<T = string> = TreeSelectCommonProps<T> & (
  | {
      multiple?: false;
      value?: T | null;
      defaultValue?: T | null;
      onChange?: (value: NoInfer<T> | null, nodes: TreeNodeOption<NoInfer<T>>[]) => void;
    }
  | {
      multiple: true;
      value?: readonly T[] | null;
      defaultValue?: readonly T[] | null;
      onChange?: (values: NoInfer<T>[], nodes: TreeNodeOption<NoInfer<T>>[]) => void;
    }
);

function toValueList<T>(value: TreeSelectValue<T>, multiple?: boolean): readonly T[] {
  if (value == null) return EMPTY_VALUES;
  if (multiple) return Array.isArray(value) ? value : EMPTY_VALUES;
  return [value as T];
}

function TreeSelectInner<T>(inputProps: TreeSelectProps<T>, ref: Ref<HTMLDivElement>) {
  const { multiple, onChange, ...defaults } = useComponentDefaults('TreeSelect', inputProps);
  const {
    control: props,
    frame,
    controlStyle,
    controlClassName,
  } = useStandaloneField(defaults);
  const {
    options,
    value: valueProp,
    defaultValue,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    size: sizeProp,
    placeholder,
    disabled: disabledProp = false,
    readOnly = false,
    invalid: invalidProp = false,
    status: statusProp,
    clearable = false,
    onClear,
    searchable = false,
    filterTreeNode,
    onSearch,
    searchPlaceholder,
    emptyText,
    defaultExpandAll = false,
    defaultExpandedKeys,
    expandedKeys: expandedKeysProp,
    onExpandedChange,
    maxTagCount,
    maxTagPlaceholder,
    removeLabel,
    renderNode,
    inheritDisabled = false,
    animation,
    icon,
    indicator,
    triggerProps,
    contentProps: panelProps = {},
    valueProps,
    viewportProps,
    optionProps,
    portalContainer,
    forceMount,
    showArrow = true,
    borderless = false,
    placement = 'bottom',
    name,
    required: requiredProp = false,
    classNames,
    styles,
    className,
    style,
    id,
    onKeyDown,
    ...rest
  } = props;
  const field = useFieldControl<TreeSelectValue<T>>({
    value: valueProp,
    id,
    status: statusProp,
    disabled: disabledProp,
  });
  const disabled = field.disabled;
  const invalid = invalidProp || frame.invalid || field.status === 'error';
  const status = frame.invalid ? 'error' : field.status === 'default' ? undefined : field.status;
  const required = requiredProp || field.required;

  const { t } = useLocale();
  const size = useComponentSize(sizeProp);
  const baseId = useId();
  const triggerAttrs = mergeProps(rest, triggerProps ?? {});
  const triggerId = field.id ?? triggerProps?.id ?? baseId + '-trigger';
  const treeId = `${baseId}-tree`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeaheadRef = useRef(createTypeahead());
  const mergedRootRef = useMergedRefs(rootRef, ref);

  const [search, setSearch] = useState('');
  const [activeValue, setActiveValue] = useState<T | null>(null);

  const interactive = !disabled && !readOnly && !triggerAttrs.hidden && !frame.fieldProps?.hidden;
  const [requestedOpen, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = interactive && requestedOpen;
  const { duration, delay, ...motion } = useAnimation(animation, 'scale');
  const present = usePresence(
    open,
    animation === undefined ? 0 : duration,
    animation === undefined ? 0 : delay,
  );

  const resolveNodes = (next: TreeSelectValue<T>): TreeNodeOption<T>[] =>
    toValueList(next, multiple)
      .map((value) => findTreeNode(options, value))
      .filter((node): node is TreeNodeOption<T> => node !== null);

  const [value, setValue] = useControllableState<TreeSelectValue<T>>({
    value: field.bound ? (field.value ?? null) : valueProp,
    defaultValue: defaultValue ?? (multiple ? EMPTY_VALUES : null),
    onChange: (next) => {
      const nodes = resolveNodes(next);
      if (multiple) onChange?.([...toValueList(next, true)], nodes);
      else onChange?.(next as T | null, nodes);
      field.onChange?.(next);
    },
  });

  const [expandedKeys, setExpandedKeys] = useControllableState<readonly T[]>({
    value: expandedKeysProp,
    defaultValue: defaultExpandAll
      ? collectExpandableKeys(options)
      : (defaultExpandedKeys ?? (EMPTY_KEYS as readonly T[])),
    onChange: onExpandedChange,
  });

  const filtered = useMemo(
    () => (search.trim().length > 0 ? filterTreeNodes(options, search, filterTreeNode) : null),
    [options, search, filterTreeNode],
  );

  const treeData = filtered ? filtered.tree : options;

  const expanded = useMemo(() => {
    const set = new Set<T>(expandedKeys as readonly T[]);
    if (filtered) filtered.expandedKeys.forEach((key) => set.add(key));
    return set;
  }, [expandedKeys, filtered]);

  const rows = useMemo(
    () => flattenVisibleTree(treeData, expanded, inheritDisabled),
    [treeData, expanded, inheritDisabled],
  );

  const selectedValues = useMemo(() => toValueList(value, multiple), [value, multiple]);
  const hasValue = selectedValues.length > 0;

  const selectedNodes = useMemo(
    () =>
      selectedValues
        .map((selected) => findTreeNode(options, selected))
        .filter((node): node is TreeNodeOption<T> => node !== null),
    [options, selectedValues],
  );

  const activeIndex = useMemo(() => {
    const index = findRowIndex(rows, activeValue);
    if (index >= 0) return index;
    return open ? firstEnabledRow(rows) : -1;
  }, [rows, activeValue, open]);

  const getNodeId = (index: number) => getOptionId(baseId, index);
  const activeId = activeIndex >= 0 ? getNodeId(activeIndex) : undefined;

  const focusTrigger = () => {
    triggerRef.current?.focus({ preventScroll: true });
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    setSearch('');
    if (restoreFocus) focusTrigger();
  };

  const expandKeysForValue = () => {
    const next = new Set<T>(expandedKeys as readonly T[]);
    if (defaultExpandAll) {
      collectExpandableKeys(options).forEach((key) => next.add(key));
    }
    selectedValues.forEach((selected) => {
      getAncestorKeys(options, selected).forEach((key) => next.add(key));
    });
    return next;
  };

  const openPanel = () => {
    if (!interactive) return;
    if (!open) {
      setExpandedKeys([...expandKeysForValue()]);
      setActiveValue(selectedValues[selectedValues.length - 1] ?? null);
    }
    setOpen(true);
  };

  const toggleExpanded = (node: TreeNodeOption<T>) => {
    if (!hasTreeChildren(node)) return;
    const isExpanded = expanded.has(node.value);
    const next = isExpanded
      ? (expandedKeys as readonly T[]).filter((key) => !Object.is(key, node.value))
      : [...expandedKeys, node.value];
    setExpandedKeys(next);
  };

  const commit = (row: TreeRow<T>) => {
    if (!interactive || row.disabled) return;
    const { node } = row;
    setActiveValue(node.value);
    if (multiple) {
      const current = selectedValues;
      const exists = current.some((item) => Object.is(item, node.value));
      setValue(
        exists ? current.filter((item) => !Object.is(item, node.value)) : [...current, node.value],
      );
      return;
    }
    setValue(node.value);
    close();
  };

  const removeValue = (valueToRemove: T) => {
    if (!interactive) return;
    setValue(selectedValues.filter((item) => !Object.is(item, valueToRemove)));
  };

  const clearValue = () => {
    if (!interactive) return;
    setValue(multiple ? [] : null);
    typeaheadRef.current.clear();
    onClear?.();
  };

  useClickOutside([rootRef, panelRef], () => setOpen(false), open);
  useEscapeKey(() => close(), open);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      if (searchable) searchRef.current?.focus({ preventScroll: true });
      else treeRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, searchable]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(getNodeId(activeIndex))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  const moveActive = (delta: number) => {
    if (rows.length === 0) return;
    const next = nextEnabledRow(rows, activeIndex, delta);
    const row = next >= 0 ? rows[next] : undefined;
    if (row) setActiveValue(row.node.value);
  };

  const revealIndex = (node: TreeNodeOption<T>) => {
    const ancestors = getAncestorKeys(options, node.value);
    if (ancestors.length === 0) return;
    const next = new Set<T>(expandedKeys as readonly T[]);
    ancestors.forEach((key) => next.add(key));
    setExpandedKeys([...next]);
  };

  const onTreeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = activeIndex >= 0 ? rows[activeIndex] : undefined;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Home': {
        event.preventDefault();
        const index = firstEnabledRow(rows);
        const row = index >= 0 ? rows[index] : undefined;
        if (row) setActiveValue(row.node.value);
        break;
      }
      case 'End': {
        event.preventDefault();
        const index = lastEnabledRow(rows);
        const row = index >= 0 ? rows[index] : undefined;
        if (row) setActiveValue(row.node.value);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!current) break;
        if (current.hasChildren && !expanded.has(current.node.value)) {
          toggleExpanded(current.node);
        } else if (current.hasChildren) {
          const child = rows[activeIndex + 1];
          if (child && child.depth > current.depth && !child.disabled) {
            setActiveValue(child.node.value);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (!current) break;
        if (current.hasChildren && expanded.has(current.node.value)) {
          toggleExpanded(current.node);
        } else if (current.parentValue !== null) {
          const parentIndex = findRowIndex(rows, current.parentValue);
          const parent = parentIndex >= 0 ? rows[parentIndex] : undefined;
          if (parent) setActiveValue(parent.node.value);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (current) commit(current);
        break;
      }
      default: {
        if (isPrintableKey(event)) {
          const query = typeaheadRef.current.push(event.key);
          const index = typeaheadRow(rows, query, activeIndex);
          const row = index >= 0 ? rows[index] : undefined;
          if (row) {
            setActiveValue(row.node.value);
            revealIndex(row.node);
          }
        }
        break;
      }
    }
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const current = activeIndex >= 0 ? rows[activeIndex] : undefined;
      if (current) commit(current);
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented) triggerProps?.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!interactive || event.nativeEvent.isComposing) return;
    if (!open) {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        openPanel();
        return;
      }
      if (multiple && event.key === 'Backspace' && hasValue) {
        event.preventDefault();
        const last = selectedValues[selectedValues.length - 1];
        if (last !== undefined) removeValue(last);
        return;
      }
      if (isPrintableKey(event)) {
        const allExpanded = new Set<T>(collectExpandableKeys(options));
        const allRows = flattenVisibleTree(options, allExpanded, inheritDisabled);
        const query = typeaheadRef.current.push(event.key);
        const index = typeaheadRow(allRows, query, -1);
        const row = index >= 0 ? allRows[index] : undefined;
        if (row) commit(row);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  const onNodeClick = (event: MouseEvent<HTMLDivElement>, row: TreeRow<T>) => {
    event.preventDefault();
    if (!treeRef.current || !treeRef.current.contains(document.activeElement)) {
      treeRef.current?.focus({ preventScroll: true });
    }
    commit(row);
  };

  const handleOptions =
    maxTagCount != null && maxTagCount >= 0 ? selectedNodes.slice(0, maxTagCount) : selectedNodes;
  const hiddenNodes =
    maxTagCount != null && maxTagCount >= 0 ? selectedNodes.slice(maxTagCount) : [];

  const defaultRemoveLabel = (node: TreeNodeOption<T>) =>
    `${t('treeSelect.remove', { zh: '移除', en: 'Remove' })} ${treeNodeText(node)}`;

  const tagNodes = handleOptions.map((node) => (
    <SelectTag
      key={String(node.value)}
      label={node.label}
      removeLabel={removeLabel ? removeLabel(node) : defaultRemoveLabel(node)}
      onRemove={!disabled && !readOnly ? () => removeValue(node.value) : undefined}
      className={classNames?.tag}
      classNames={{ tagLabel: classNames?.tagLabel, tagRemove: classNames?.tagRemove }}
    />
  ));

  const singleLabel = selectedNodes[0]?.label ?? null;

  return (
    <StandaloneField
      frame={frame}
      id={triggerId}
      hidden={triggerAttrs.hidden}
      required={required}
      focusControl={() => triggerRef.current?.focus()}
    >
      <div
        ref={mergedRootRef}
        data-slot="tree-select"
        data-size={size}
        data-open={open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-invalid={invalid || status === 'error' ? '' : undefined}
        data-status={status}
        data-multiple={multiple ? '' : undefined}
        data-value={hasValue ? selectedValues.map((item) => String(item)).join(',') : undefined}
        className={cx('yuki-select-root', 'yuki-tree-select', className, classNames?.root)}
        style={{ ...style, ...styles?.root }}
      >
        {name != null &&
          (multiple ? (
            selectedValues.map((item) => (
              <input
                key={String(item)}
                type="hidden"
                name={name}
                value={String(item)}
                disabled={disabled}
                required={required}
              />
            ))
          ) : (
            <input
              type="hidden"
              name={name}
              value={hasValue ? String(selectedValues[0]) : ''}
              disabled={disabled}
              required={required}
            />
          ))}
        <SelectTrigger
          {...triggerAttrs}
          arrowIcon={icon}
          valueProps={valueProps}
          ref={triggerRef}
          id={triggerId}
          aria-invalid={invalid || triggerAttrs['aria-invalid']}
          aria-labelledby={
            triggerAttrs['aria-labelledby'] ??
            (frame.hasLabel ? (frame.labelProps?.id ?? triggerId + '-label') : field.labelId)
          }
          aria-describedby={fieldDescription(
            frame,
            triggerId,
            triggerAttrs['aria-describedby'],
            field.ariaProps['aria-describedby'],
          )}
          aria-busy={field.ariaProps['aria-busy'] ?? triggerAttrs['aria-busy']}
          onBlur={(event) => {
            triggerAttrs.onBlur?.(event);
            field.onBlur?.();
          }}
          role="combobox"
          open={open}
          size={size}
          disabled={disabled}
          invalid={invalid}
          status={status}
          borderless={borderless}
          multiple={multiple}
          placeholder={placeholder ?? t('treeSelect.placeholder', { zh: '请选择', en: 'Select' })}
          value={multiple ? undefined : singleLabel}
          hasValue={hasValue}
          showArrow={showArrow}
          clearable={clearable && !readOnly}
          onClear={clearValue}
          clearLabel={t('common.clear', { zh: '清除', en: 'Clear' })}
          aria-haspopup="tree"
          aria-controls={open ? treeId : undefined}
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          className={cx(
            'yuki-tree-select__trigger',
            classNames?.trigger,
            controlClassName,
            triggerAttrs.className,
          )}
          classNames={{
            value: classNames?.value,
            placeholder: classNames?.placeholder,
            prefix: classNames?.prefix,
            suffix: classNames?.suffix,
            clear: classNames?.clear,
            arrow: classNames?.arrow,
            tag: classNames?.tag,
            tagLabel: classNames?.tagLabel,
            tagRemove: classNames?.tagRemove,
          }}
          style={{ ...styles?.trigger, ...controlStyle, ...triggerAttrs.style }}
          onClick={(event) => {
            triggerAttrs.onClick?.(event);
            if (event.defaultPrevented || !interactive) return;
            if (open) close();
            else openPanel();
          }}
          onKeyDown={onTriggerKeyDown}
        >
          {multiple && hasValue ? (
            <span
              data-slot="tags"
              className={cx(
                'yuki-select-trigger__value',
                'yuki-tree-select__tags',
                classNames?.tags,
              )}
            >
              {tagNodes}
              {hiddenNodes.length > 0 && (
                <span data-slot="more" className="yuki-tree-select__more">
                  {maxTagPlaceholder ? maxTagPlaceholder(hiddenNodes) : `+${hiddenNodes.length}`}
                </span>
              )}
            </span>
          ) : null}
        </SelectTrigger>
        <Popup
          container={portalContainer}
          forceMount={forceMount}
          open={open || (animation !== undefined && !forceMount && present)}
          data-state={open ? 'open' : 'closed'}
          surfaceProps={{
            ...(animation === undefined ? {} : motion),
            'aria-hidden': open ? undefined : true,
            inert: inertValue(!open),
          }}
          anchorRef={triggerRef}
          placement={placement}
          role="dialog"
          aria-label={t('treeSelect.dialog', { zh: '选择选项', en: 'Choose option' })}
        >
          <div
            {...panelProps}
            ref={panelRef}
            data-slot="panel"
            className={cx('yuki-tree-select__panel', classNames?.panel, panelProps.className)}
            style={{ ...styles?.panel, ...panelProps.style }}
          >
            {searchable && (
              <div
                data-slot="search"
                className={cx('yuki-tree-select__search', classNames?.search)}
              >
                <Icon name="search" size="1em" />
                <input
                  ref={searchRef}
                  type="text"
                  role="textbox"
                  aria-label={
                    searchPlaceholder ??
                    t('treeSelect.search', { zh: '搜索选项', en: 'Search options' })
                  }
                  placeholder={
                    searchPlaceholder ?? t('common.search', { zh: '搜索', en: 'Search' })
                  }
                  value={search}
                  disabled={disabled}
                  className={cx('yuki-tree-select__search-input', classNames?.searchInput)}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    onSearch?.(event.target.value);
                  }}
                  onKeyDown={onSearchKeyDown}
                />
              </div>
            )}
            {rows.length === 0 ? (
              <SelectPanelStatus className={classNames?.empty}>
                {emptyText ?? t('common.noData', { zh: '暂无数据', en: 'No data' })}
              </SelectPanelStatus>
            ) : (
              <div
                {...viewportProps}
                ref={treeRef}
                id={treeId}
                role="tree"
                aria-label={
                  viewportProps?.['aria-label'] ??
                  t('treeSelect.tree', { zh: '选项树', en: 'Options tree' })
                }
                aria-multiselectable={multiple || undefined}
                aria-activedescendant={activeId}
                tabIndex={0}
                data-slot="tree"
                className={cx('yuki-tree-select__tree', classNames?.tree, viewportProps?.className)}
                style={{ ...styles?.tree, ...viewportProps?.style }}
                onKeyDown={(event) => {
                  viewportProps?.onKeyDown?.(event);
                  if (!event.defaultPrevented) onTreeKeyDown(event);
                }}
              >
                {rows.map((row, index) => {
                  const node = row.node;
                  const itemProps = optionProps?.(node, index);
                  const isSelected = selectedValues.some((item) => Object.is(item, node.value));
                  const isActive = index === activeIndex;
                  const isExpanded = row.hasChildren && expanded.has(node.value);
                  return (
                    <div
                      {...itemProps}
                      key={getNodeId(index)}
                      id={getNodeId(index)}
                      role="treeitem"
                      aria-level={row.depth + 1}
                      aria-expanded={row.hasChildren ? isExpanded : undefined}
                      aria-selected={multiple ? undefined : isSelected}
                      aria-checked={multiple ? isSelected : undefined}
                      aria-disabled={row.disabled || undefined}
                      data-slot="node"
                      data-depth={row.depth}
                      data-value={String(node.value)}
                      data-expanded={row.hasChildren ? isExpanded : undefined}
                      data-active={isActive ? '' : undefined}
                      data-selected={isSelected ? '' : undefined}
                      data-disabled={row.disabled ? '' : undefined}
                      className={cx(
                        'yuki-tree-select__node',
                        isActive && 'yuki-tree-select__node--active',
                        isSelected && 'yuki-tree-select__node--selected',
                        row.disabled && 'yuki-tree-select__node--disabled',
                        classNames?.node,
                        itemProps?.className,
                      )}
                      style={{
                        paddingInlineStart: `calc(var(--yuki-space-2) + ${row.depth} * var(--yuki-space-4))`,
                        ...itemProps?.style,
                      }}
                      onMouseEnter={(event) => {
                        itemProps?.onMouseEnter?.(event);
                        if (!event.defaultPrevented && !row.disabled) setActiveValue(node.value);
                      }}
                      onClick={(event) => {
                        itemProps?.onClick?.(event);
                        if (!event.defaultPrevented) onNodeClick(event, row);
                      }}
                    >
                      <span
                        data-slot="node-toggle"
                        aria-hidden="true"
                        className={cx(
                          'yuki-tree-select__node-toggle',
                          !row.hasChildren && 'yuki-tree-select__node-toggle--empty',
                          classNames?.nodeToggle,
                        )}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleExpanded(node);
                        }}
                      >
                        {row.hasChildren && <Icon name="chevron-right" size="1em" />}
                      </span>
                      {multiple && (
                        <span
                          aria-hidden="true"
                          data-slot="node-checkbox"
                          data-checked={isSelected ? '' : undefined}
                          className={cx(
                            'yuki-tree-select__node-checkbox',
                            classNames?.nodeCheckbox,
                          )}
                        >
                          {isSelected &&
                            (indicator === undefined ? (
                              <Icon name="check" size="1em" />
                            ) : (
                              indicator
                            ))}
                        </span>
                      )}
                      {!multiple && isSelected && indicator != null && (
                        <span aria-hidden="true">{indicator}</span>
                      )}
                      <span
                        data-slot="node-content"
                        className={cx('yuki-tree-select__node-content', classNames?.nodeContent)}
                      >
                        {renderNode ? (
                          renderNode(node, {
                            depth: row.depth,
                            expanded: isExpanded,
                            selected: isSelected,
                            active: isActive,
                            disabled: row.disabled,
                            leaf: row.leaf,
                          })
                        ) : (
                          <span
                            data-slot="node-label"
                            className={cx('yuki-tree-select__node-label', classNames?.nodeLabel)}
                          >
                            {node.label}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Popup>
      </div>
    </StandaloneField>
  );
}

export const TreeSelect = forwardRef(TreeSelectInner) as <T = string>(
  props: TreeSelectProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

(TreeSelect as { displayName?: string }).displayName = 'TreeSelect';

export default TreeSelect;
