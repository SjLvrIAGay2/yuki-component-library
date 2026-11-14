import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useVirtualList } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Checkbox } from '../checkbox';
import { Icon } from '../icon';

export type TreeKey = string | number;

export interface TreeNodeData {
  key: TreeKey;
  title?: ReactNode;
  children?: readonly TreeNodeData[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
}

export interface TreeFieldNames<T> {
  key?: keyof T & string;
  title?: keyof T & string;
  children?: keyof T & string;
  disabled?: keyof T & string;
  disableCheckbox?: keyof T & string;
  isLeaf?: keyof T & string;
}

export interface TreeClassNames {
  root?: string;
  viewport?: string;
  list?: string;
  virtualContent?: string;
  item?: string;
  switcher?: string;
  switcherIcon?: string;
  checkbox?: string;
  title?: string;
  titleText?: string;
  empty?: string;
  loading?: string;
  spinner?: string;
}

export interface TreeStyles {
  root?: StyleProperties;
  viewport?: StyleProperties;
  list?: StyleProperties;
  virtualContent?: StyleProperties;
  item?: StyleProperties;
  switcher?: StyleProperties;
  switcherIcon?: StyleProperties;
  checkbox?: StyleProperties;
  title?: StyleProperties;
  titleText?: StyleProperties;
  empty?: StyleProperties;
  loading?: StyleProperties;
  spinner?: StyleProperties;
}

export interface TreeSelectInfo<T> {
  node: T;
  selected: boolean;
  selectedNodes: T[];
}

export interface TreeCheckInfo<T> {
  node: T;
  checked: boolean;
  checkedNodes: T[];
}

export interface TreeExpandInfo<T> {
  node: T;
  expanded: boolean;
}

export interface TreeTitleInfo {
  key: TreeKey;
  depth: number;
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  indeterminate: boolean;
}

export interface TreeVirtualConfig {
  /** Viewport height in pixels. Virtualisation needs a bounded viewport. */
  height: number;
  itemSize?: number;
  overscan?: number;
}

export interface TreeOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  children?: readonly TreeOption[];
}

export interface TreeProps<T extends object = TreeNodeData>
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'children' | 'onSelect'> {
  treeData: readonly T[];
  /** Map your node shape onto the tree fields. Defaults to key/title/children/…. */
  fieldNames?: TreeFieldNames<T>;
  size?: Size;
  disabled?: boolean;
  /** Render checkboxes on every node (with half-checked parents). */
  checkable?: boolean;
  /** When true, parent and child check states are independent. */
  checkStrictly?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  expandedKeys?: readonly TreeKey[];
  defaultExpandedKeys?: readonly TreeKey[];
  defaultExpandAll?: boolean;
  onExpand?: (expandedKeys: TreeKey[], info: TreeExpandInfo<T>) => void;
  checkedKeys?: readonly TreeKey[];
  defaultCheckedKeys?: readonly TreeKey[];
  onCheck?: (checkedKeys: TreeKey[], info: TreeCheckInfo<T>) => void;
  selectedKeys?: readonly TreeKey[];
  defaultSelectedKeys?: readonly TreeKey[];
  onSelect?: (selectedKeys: TreeKey[], info: TreeSelectInfo<T>) => void;
  /** Custom title renderer; receives the node and its interaction state. */
  renderTitle?: (node: T, info: TreeTitleInfo) => ReactNode;
  /** Replace the default chevron switcher. */
  switcherIcon?: ReactNode;
  virtual?: TreeVirtualConfig;
  loading?: boolean;
  emptyRender?: () => ReactNode;
  classNames?: TreeClassNames;
  styles?: TreeStyles;
}

export interface TreeOptionsProps extends Omit<TreeProps<TreeOption>,
  'treeData' | 'fieldNames' | 'multiple' | 'checkable' | 'checkStrictly' |
  'checkedKeys' | 'defaultCheckedKeys' | 'onCheck' | 'selectedKeys' | 'defaultSelectedKeys' | 'onSelect'
> {
  options: readonly TreeOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface NodeMeta<T> {
  node: T;
  key: TreeKey;
  depth: number;
  parentKey: TreeKey | null;
  hasChildren: boolean;
}

interface FlatNode<T> extends NodeMeta<T> {
  siblingCount: number;
}

type ParentKey = TreeKey | null;

function readField<T extends object>(node: T, field: keyof T & string): unknown {
  return (node as unknown as Record<string, unknown>)[field];
}

function treeFieldNames<T>(fieldNames?: TreeFieldNames<T>): Required<TreeFieldNames<T>> {
  return {
    key: fieldNames?.key ?? ('key' as keyof T & string),
    title: fieldNames?.title ?? ('title' as keyof T & string),
    children: fieldNames?.children ?? ('children' as keyof T & string),
    disabled: fieldNames?.disabled ?? ('disabled' as keyof T & string),
    disableCheckbox: fieldNames?.disableCheckbox ?? ('disableCheckbox' as keyof T & string),
    isLeaf: fieldNames?.isLeaf ?? ('isLeaf' as keyof T & string),
  };
}

function TreeInner<T extends object = TreeNodeData>(
  inputProps: TreeProps<T> & { selectLeaves?: boolean },
  ref: Ref<HTMLDivElement>,
) {
  const props = inputProps;
  const {
    treeData,
    selectLeaves = false,
    fieldNames,
    size: sizeProp,
    disabled = false,
    checkable = false,
    checkStrictly = false,
    selectable = true,
    multiple = false,
    expandedKeys: expandedKeysProp,
    defaultExpandedKeys,
    defaultExpandAll = false,
    onExpand,
    checkedKeys: checkedKeysProp,
    defaultCheckedKeys,
    onCheck,
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    onSelect,
    renderTitle,
    switcherIcon,
    virtual,
    loading = false,
    emptyRender,
    classNames,
    styles,
    className,
    style,
    onKeyDown,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const fields = useMemo(() => treeFieldNames(fieldNames), [fieldNames]);

  /* ----------------------------------------------------------------------- *
   * Tree structure
   * ----------------------------------------------------------------------- */
  const { nodeMap, childrenMap } = useMemo(() => {
    const nodes = new Map<TreeKey, NodeMeta<T>>();
    const children = new Map<ParentKey, TreeKey[]>();

    const walk = (list: readonly T[], parentKey: ParentKey, depth: number): void => {
      const keys: TreeKey[] = [];
      list.forEach((node, index) => {
        const rawKey = readField(node, fields.key);
        const key: TreeKey =
          typeof rawKey === 'string' || typeof rawKey === 'number'
            ? rawKey
            : `${String(parentKey ?? 'root')}-${index}`;
        const rawChildren = readField(node, fields.children);
        const childList = Array.isArray(rawChildren) ? (rawChildren as T[]) : [];
        const isLeaf = readField(node, fields.isLeaf) === true;
        const hasChildren = !isLeaf && childList.length > 0;

        nodes.set(key, { node, key, depth, parentKey, hasChildren });
        keys.push(key);
        if (hasChildren) walk(childList, key, depth + 1);
      });
      children.set(parentKey, keys);
    };

    walk(treeData, null, 0);
    return { nodeMap: nodes, childrenMap: children };
  }, [treeData, fields]);

  const allParentKeys = useMemo(
    () => Array.from(nodeMap.values()).filter((meta) => meta.hasChildren).map((meta) => meta.key),
    [nodeMap],
  );

  const initialExpandedKeys = useMemo<readonly TreeKey[]>(
    () => (defaultExpandAll ? allParentKeys : (defaultExpandedKeys ?? [])),
    // Intentionally computed once for the uncontrolled initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [expandedKeysState, setExpandedKeys] = useControllableState<readonly TreeKey[]>({
    value: expandedKeysProp,
    defaultValue: initialExpandedKeys,
  });
  const [checkedKeysState, setCheckedKeys] = useControllableState<readonly TreeKey[]>({
    value: checkedKeysProp,
    defaultValue: defaultCheckedKeys ?? [],
  });
  const [selectedKeysState, setSelectedKeys] = useControllableState<readonly TreeKey[]>({
    value: selectedKeysProp,
    defaultValue: defaultSelectedKeys ?? [],
  });

  const expandedSet = new Set(expandedKeysState);
  const checkedSet = new Set(checkedKeysState);
  const selectedSet = new Set(selectedKeysState);

  const visibleNodes = useMemo<FlatNode<T>[]>(() => {
    const out: FlatNode<T>[] = [];
    const visit = (parentKey: ParentKey): void => {
      const keys = childrenMap.get(parentKey) ?? [];
      keys.forEach((key) => {
        const meta = nodeMap.get(key);
        if (!meta) return;
        out.push({ ...meta, siblingCount: keys.length });
        if (meta.hasChildren && expandedSet.has(key)) visit(key);
      });
    };
    visit(null);
    return out;
    // expandedSet is derived from expandedKeysState below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenMap, nodeMap, expandedKeysState]);

  const visibleIndexByKey = useMemo(() => {
    const index = new Map<TreeKey, number>();
    visibleNodes.forEach((meta, position) => index.set(meta.key, position));
    return index;
  }, [visibleNodes]);

  const isNodeDisabled = useCallback(
    (meta: NodeMeta<T>): boolean =>
      disabled || readField(meta.node, fields.disabled) === true,
    [disabled, fields.disabled],
  );

  /* ----------------------------------------------------------------------- *
   * Checking
   * ----------------------------------------------------------------------- */
  const isCheckboxDisabled = useCallback(
    (meta: NodeMeta<T>): boolean =>
      isNodeDisabled(meta) || readField(meta.node, fields.disableCheckbox) === true,
    [fields.disableCheckbox, isNodeDisabled],
  );

  const collectSubtreeKeys = useCallback(
    (key: TreeKey): TreeKey[] => {
      const keys: TreeKey[] = [];
      const stack: TreeKey[] = [key];
      while (stack.length > 0) {
        const current = stack.pop() as TreeKey;
        keys.push(current);
        stack.push(...(childrenMap.get(current) ?? []));
      }
      return keys;
    },
    [childrenMap],
  );

  const descendantKeys = useCallback(
    (key: TreeKey): TreeKey[] => collectSubtreeKeys(key).filter((item) => item !== key),
    [collectSubtreeKeys],
  );

  const checkState = useCallback(
    (meta: NodeMeta<T>): { checked: boolean; indeterminate: boolean } => {
      const directlyChecked = checkedSet.has(meta.key);
      if (checkStrictly) return { checked: directlyChecked, indeterminate: false };
      const descendants = descendantKeys(meta.key).filter((key) => {
        const descendant = nodeMap.get(key);
        return descendant ? !isCheckboxDisabled(descendant) : false;
      });
      if (descendants.length === 0) return { checked: directlyChecked, indeterminate: false };
      const checkedCount = descendants.filter((key) => checkedSet.has(key)).length;
      const allChecked = checkedCount === descendants.length;
      return {
        checked: directlyChecked || allChecked,
        indeterminate: !directlyChecked && !allChecked && checkedCount > 0,
      };
    },
    [checkedSet, checkStrictly, descendantKeys, isCheckboxDisabled, nodeMap],
  );

  const toggleCheck = useCallback(
    (meta: NodeMeta<T>, nextChecked: boolean) => {
      const next = new Set(checkedSet);
      const subtree = checkStrictly ? [meta.key] : collectSubtreeKeys(meta.key);
      subtree.forEach((key) => {
        const item = nodeMap.get(key);
        if (!item || isCheckboxDisabled(item)) return;
        if (nextChecked) next.add(key);
        else next.delete(key);
      });

      if (!checkStrictly) {
        let parentKey = meta.parentKey;
        while (parentKey != null) {
          const childKeys = childrenMap.get(parentKey) ?? [];
          const checkableChildren = childKeys.filter((key) => {
            const child = nodeMap.get(key);
            return child ? !isCheckboxDisabled(child) : false;
          });
          const allChecked =
            checkableChildren.length > 0 &&
            checkableChildren.every((key) => next.has(key));
          if (allChecked) next.add(parentKey);
          else next.delete(parentKey);
          const parent = nodeMap.get(parentKey);
          parentKey = parent?.parentKey ?? null;
        }
      }

      const keys = Array.from(next);
      const checkedNodes = keys
        .map((key) => nodeMap.get(key)?.node)
        .filter((node): node is T => node !== undefined);
      setCheckedKeys(keys);
      onCheck?.(keys, { node: meta.node, checked: nextChecked, checkedNodes });
    },
    [
      checkedSet,
      childrenMap,
      checkStrictly,
      collectSubtreeKeys,
      isCheckboxDisabled,
      nodeMap,
      onCheck,
      setCheckedKeys,
    ],
  );

  /* ----------------------------------------------------------------------- *
   * Expansion / selection
   * ----------------------------------------------------------------------- */
  const toggleExpand = useCallback(
    (meta: NodeMeta<T>) => {
      if (!meta.hasChildren) return;
      const expanded = !expandedSet.has(meta.key);
      const next = expanded
        ? [...expandedKeysState, meta.key]
        : expandedKeysState.filter((key) => key !== meta.key);
      setExpandedKeys(next);
      onExpand?.(next, { node: meta.node, expanded });
    },
    [expandedKeysState, expandedSet, onExpand, setExpandedKeys],
  );

  const selectNode = useCallback(
    (meta: NodeMeta<T>, additive = multiple) => {
      if (selectLeaves && meta.hasChildren) {
        toggleExpand(meta);
        return;
      }
      if (!selectable || isNodeDisabled(meta)) return;
      const isSelected = selectedSet.has(meta.key);
      let next: TreeKey[];
      if (additive) {
        next = isSelected
          ? selectedKeysState.filter((key) => key !== meta.key)
          : [...selectedKeysState, meta.key];
      } else {
        next = isSelected ? [] : [meta.key];
      }
      const selectedNodes = next
        .map((key) => nodeMap.get(key)?.node)
        .filter((node): node is T => node !== undefined);
      setSelectedKeys(next);
      onSelect?.(next, { node: meta.node, selected: !isSelected, selectedNodes });
    },
    [
      isNodeDisabled,
      selectLeaves,
      toggleExpand,
      multiple,
      nodeMap,
      onSelect,
      selectable,
      selectedKeysState,
      selectedSet,
      setSelectedKeys,
    ],
  );

  /* ----------------------------------------------------------------------- *
   * Keyboard navigation (roving tabindex)
   * ----------------------------------------------------------------------- */
  const itemRefs = useRef(new Map<TreeKey, HTMLDivElement>());
  const [activeKey, setActiveKey] = useState<TreeKey | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const navigableNodes = visibleNodes.filter((meta) => !isNodeDisabled(meta));
  const effectiveActiveKey =
    activeKey != null && visibleIndexByKey.has(activeKey)
      ? activeKey
      : (navigableNodes[0]?.key ?? null);

  const itemSize = virtual?.itemSize ?? 32;
  const virtualizer = useVirtualList({
    count: virtual != null ? visibleNodes.length : 0,
    itemSize,
    overscan: virtual?.overscan,
    scrollRef: viewportRef,
    enabled: virtual != null,
  });

  const focusKey = useCallback(
    (key: TreeKey) => {
      setActiveKey(key);
      const existing = itemRefs.current.get(key);
      if (existing) {
        existing.focus();
        return;
      }
      if (virtual != null) {
        const index = visibleIndexByKey.get(key);
        if (index != null) virtualizer.scrollToIndex(index, 'start');
      }
      const frame =
        typeof requestAnimationFrame === 'function'
          ? requestAnimationFrame
          : (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0);
      frame(() => itemRefs.current.get(key)?.focus());
    },
    [virtual, visibleIndexByKey, virtualizer],
  );

  useEffect(() => {
    if (activeKey != null && !visibleIndexByKey.has(activeKey)) setActiveKey(null);
  }, [activeKey, visibleIndexByKey]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const active = effectiveActiveKey;
    if (active == null) return;
    const meta = nodeMap.get(active);
    if (!meta) return;

    const position = navigableNodes.findIndex((item) => item.key === active);
    const moveTo = (target: FlatNode<T> | undefined, shouldFocus = true) => {
      if (!target) return false;
      if (shouldFocus) focusKey(target.key);
      else setActiveKey(target.key);
      return true;
    };

    switch (event.key) {
      case 'ArrowDown': {
        if (moveTo(navigableNodes[position + 1])) event.preventDefault();
        break;
      }
      case 'ArrowUp': {
        if (position > 0 && moveTo(navigableNodes[position - 1])) event.preventDefault();
        break;
      }
      case 'Home': {
        if (moveTo(navigableNodes[0])) event.preventDefault();
        break;
      }
      case 'End': {
        if (moveTo(navigableNodes[navigableNodes.length - 1])) event.preventDefault();
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (meta.hasChildren && !expandedSet.has(meta.key)) {
          toggleExpand(meta);
        } else if (meta.hasChildren) {
          const childKeys = childrenMap.get(meta.key) ?? [];
          const firstChild = childKeys
            .map((key) => nodeMap.get(key))
            .find((child): child is NodeMeta<T> => child != null && !isNodeDisabled(child));
          if (firstChild) focusKey(firstChild.key);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (meta.hasChildren && expandedSet.has(meta.key)) {
          toggleExpand(meta);
        } else if (meta.parentKey != null) {
          const parent = nodeMap.get(meta.parentKey);
          if (parent) focusKey(parent.key);
        }
        break;
      }
      case 'Enter': {
        event.preventDefault();
        selectNode(meta);
        break;
      }
      case ' ': {
        if (checkable) {
          if (!isCheckboxDisabled(meta)) {
            event.preventDefault();
            toggleCheck(meta, !checkState(meta).checked);
          }
        } else {
          event.preventDefault();
          selectNode(meta);
        }
        break;
      }
      default:
        break;
    }
  };

  /* ----------------------------------------------------------------------- *
   * Rendering
   * ----------------------------------------------------------------------- */
  const renderNode = (meta: FlatNode<T>, virtualStyle?: CSSProperties): ReactElement => {
    const expanded = expandedSet.has(meta.key);
    const selected = selectedSet.has(meta.key);
    const nodeDisabled = isNodeDisabled(meta);
    const { checked, indeterminate } = checkable
      ? checkState(meta)
      : { checked: false, indeterminate: false };
    const titleValue = readField(meta.node, fields.title);
    const titleInfo: TreeTitleInfo = {
      key: meta.key,
      depth: meta.depth,
      expanded,
      selected,
      checked,
      indeterminate,
    };
    const indentStyle: CSSProperties = {
      paddingInlineStart: `calc(var(--yuki-tree-indent) * ${meta.depth})`,
    };

    const handleItemClick = () => {
      if (nodeDisabled) return;
      setActiveKey(meta.key);
      // A multiple tree toggles the clicked node; a single tree replaces the
      // selection (and clears it when the node was already selected).
      selectNode(meta);
    };

    return (
      <div
        key={meta.key}
        ref={(element) => {
          if (element) itemRefs.current.set(meta.key, element);
          else itemRefs.current.delete(meta.key);
        }}
        role="treeitem"
        data-slot="item"
        data-key={String(meta.key)}
        data-depth={meta.depth}
        data-expanded={meta.hasChildren ? expanded : undefined}
        data-selected={selected || undefined}
        data-checked={checkable ? checked || undefined : undefined}
        data-indeterminate={indeterminate || undefined}
        data-disabled={nodeDisabled || undefined}
        aria-level={meta.depth + 1}
        aria-setsize={meta.siblingCount}
        aria-posinset={
          (childrenMap.get(meta.parentKey) ?? []).indexOf(meta.key) + 1 || undefined
        }
        aria-expanded={meta.hasChildren ? expanded : undefined}
        aria-selected={selectable && !(selectLeaves && meta.hasChildren) ? selected : undefined}
        aria-checked={checkable ? (indeterminate ? 'mixed' : checked) : undefined}
        aria-disabled={nodeDisabled || undefined}
        tabIndex={nodeDisabled ? -1 : meta.key === effectiveActiveKey ? 0 : -1}
        className={cx(
          'yuki-tree__item',
          selected && 'yuki-tree__item--selected',
          nodeDisabled && 'yuki-tree__item--disabled',
          classNames?.item,
        )}
        style={{
          ...indentStyle,
          ...virtualStyle,
          ...styles?.item,
        }}
        onClick={handleItemClick}
      >
        {meta.hasChildren ? (
          <button
            type="button"
            data-slot="switcher"
            tabIndex={-1}
            aria-label={
              expanded
                ? t('tree.collapseNode', {
                    zh: `收起 ${String(titleValue ?? '')}`,
                    en: `Collapse ${String(titleValue ?? '')}`,
                  })
                : t('tree.expandNode', {
                    zh: `展开 ${String(titleValue ?? '')}`,
                    en: `Expand ${String(titleValue ?? '')}`,
                  })
            }
            className={cx('yuki-tree__switcher', classNames?.switcher)}
            style={styles?.switcher}
            onClick={(event) => {
              event.stopPropagation();
              setActiveKey(meta.key);
              toggleExpand(meta);
            }}
          >
            {switcherIcon ?? (
              <Icon
                name="chevron-right"
                className={cx('yuki-tree__switcher-icon', classNames?.switcherIcon)}
                style={styles?.switcherIcon}
                size="var(--yuki-icon-size-xs)"
              />
            )}
          </button>
        ) : (
          <span
            aria-hidden="true"
            data-slot="switcher-placeholder"
            className="yuki-tree__switcher-placeholder"
          />
        )}
        {checkable && (
          <span
            data-slot="checkbox"
            className={cx('yuki-tree__checkbox', classNames?.checkbox)}
            style={styles?.checkbox}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              disabled={isCheckboxDisabled(meta)}
              tabIndex={-1}
              aria-label={
                readField(meta.node, fields.title) == null
                  ? t('tree.checkNode', { zh: '选择节点', en: 'Select node' })
                  : t('tree.checkNodeTitle', {
                      zh: `选择 ${String(titleValue)}`,
                      en: `Select ${String(titleValue)}`,
                    })
              }
              onChange={(next) => toggleCheck(meta, next)}
            />
          </span>
        )}
        <span
          data-slot="title"
          className={cx(
            'yuki-tree__title',
            selectable && !nodeDisabled && 'yuki-tree__title--selectable',
            classNames?.title,
          )}
          style={styles?.title}
        >
          {renderTitle ? (
            renderTitle(meta.node, titleInfo)
          ) : (
            <span
              data-slot="title-text"
              className={cx('yuki-tree__title-text', classNames?.titleText)}
              style={styles?.titleText}
            >
              {titleValue as ReactNode}
            </span>
          )}
        </span>
      </div>
    );
  };

  const emptyNode = emptyRender ? (
    emptyRender()
  ) : (
    <div
      data-slot="empty"
      className={cx('yuki-tree__empty', classNames?.empty)}
      style={styles?.empty}
    >
      {t('tree.empty', { zh: '暂无数据', en: 'No data' })}
    </div>
  );

  return (
    <div
      {...rest}
      ref={ref}
      role="tree"
      data-slot="tree"
      data-size={size}
      data-checkable={checkable || undefined}
      data-disabled={disabled || undefined}
      aria-multiselectable={multiple || undefined}
      aria-busy={loading || undefined}
      className={cx('yuki-tree', `yuki-tree--${size}`, classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      onKeyDown={handleKeyDown}
    >
      {virtual != null ? (
        <div
          ref={viewportRef}
          data-slot="viewport"
          className={cx('yuki-tree__viewport', classNames?.viewport)}
          style={{ height: virtual.height, ...styles?.viewport }}
        >
          <div
            data-slot="virtual-content"
            className={cx('yuki-tree__virtual-content', classNames?.virtualContent)}
            style={{ height: virtualizer.totalSize, ...styles?.virtualContent }}
          >
            {virtualizer.virtualItems.map((item) => {
              const meta = visibleNodes[item.index];
              if (!meta) return null;
              return renderNode(meta, {
                position: 'absolute',
                top: item.start,
                insetInline: 0,
                height: item.size,
              });
            })}
          </div>
        </div>
      ) : (
        <div
          data-slot="list"
          role="presentation"
          className={cx('yuki-tree__list', classNames?.list)}
          style={styles?.list}
        >
          {visibleNodes.map((meta) => renderNode(meta))}
        </div>
      )}

      {!loading && visibleNodes.length === 0 && emptyNode}

      {loading && (
        <div
          role="status"
          aria-live="polite"
          data-slot="loading"
          className={cx('yuki-tree__loading', classNames?.loading)}
          style={styles?.loading}
        >
          <Icon
            name="loader"
            spin
            className={cx('yuki-tree__spinner', classNames?.spinner)}
            style={styles?.spinner}
            size="var(--yuki-icon-size-md)"
          />
          <span className="yuki-visually-hidden">
            {t('tree.loading', { zh: '正在加载', en: 'Loading' })}
          </span>
        </div>
      )}
    </div>
  );
}

const DataTree = forwardRef(TreeInner) as <T extends object>(
  props: TreeProps<T> & { ref?: Ref<HTMLDivElement>; selectLeaves?: boolean },
) => ReactElement;

function normalizeOptions(options: readonly TreeOption[], parentDisabled = false): TreeOption[] {
  return options.map(option => {
    const disabled = parentDisabled || option.disabled === true;
    return {
      ...option,
      // A disabled branch can still be browsed, but none of its leaves can be selected.
      disabled: !option.children?.length && disabled,
      children: option.children?.length ? normalizeOptions(option.children, disabled) : undefined,
    };
  });
}

const optionFields = { key: 'value', title: 'label' } as const;

function OptionTree({ options, value, defaultValue, onValueChange, treeRef, ...props }:
  TreeOptionsProps & { treeRef: Ref<HTMLDivElement> }) {
  const [selected, setSelected] = useControllableState({ value, defaultValue: defaultValue ?? '' });
  const data = useMemo(() => normalizeOptions(options), [options]);
  return (
    <DataTree {...props} ref={treeRef} treeData={data} fieldNames={optionFields} selectLeaves
      selectedKeys={selected ? [selected] : []}
      onSelect={(_, { node }) => { setSelected(node.value); onValueChange?.(node.value); }}
    />
  );
}

function TreeRoot<T extends object>(input: TreeProps<T> | TreeOptionsProps, ref: Ref<HTMLDivElement>) {
  const props = useComponentDefaults('Tree', input);
  return 'options' in props
    ? <OptionTree {...props} treeRef={ref} />
    : <DataTree {...props} ref={ref} />;
}

export const Tree = forwardRef(TreeRoot) as {
  <T extends object = TreeNodeData>(props: TreeProps<T> & { ref?: Ref<HTMLDivElement> }): ReactElement;
  (props: TreeOptionsProps & { ref?: Ref<HTMLDivElement> }): ReactElement;
};
