import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  createContext,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx } from '../../internal/cx';
import { Popup } from '../../internal/Popup';
import { useControllableState, useEventCallback, useMergedRefs } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

export type MenuMode = 'horizontal' | 'vertical' | 'inline';
export type MenuItemType = 'item' | 'divider' | 'group';

export interface MenuItemConfig {
  /** Stable identity used by selectedKeys / openKeys. */
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** Trailing content, e.g. a badge or shortcut hint. */
  extra?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  /** `divider` renders a separator, `group` labels its children. */
  type?: MenuItemType;
  /** When present the row renders as a link. */
  href?: string;
  onClick?: (info: { key: string; item: MenuItemConfig; event: MouseEvent<HTMLElement> }) => void;
  /** Nested items turn the row into a submenu. */
  children?: MenuItemConfig[];
}

export interface MenuClassNames {
  root?: string;
  item?: string;
  itemIcon?: string;
  itemLabel?: string;
  itemExtra?: string;
  submenu?: string;
  submenuTrigger?: string;
  submenuArrow?: string;
  submenuList?: string;
  popup?: string;
  group?: string;
  groupTitle?: string;
  divider?: string;
}

export interface MenuStyles {
  root?: StyleProperties;
  item?: StyleProperties;
  itemIcon?: StyleProperties;
  itemLabel?: StyleProperties;
  itemExtra?: StyleProperties;
  submenu?: StyleProperties;
  submenuTrigger?: StyleProperties;
  submenuArrow?: StyleProperties;
  submenuList?: StyleProperties;
  popup?: StyleProperties;
  group?: StyleProperties;
  groupTitle?: StyleProperties;
  divider?: StyleProperties;
}

export interface MenuProps
  extends Omit<WithStyle<HTMLAttributes<HTMLUListElement>>, 'children' | 'onSelect'> {
  /** Menu tree. Nested `children` become submenus. */
  items: MenuItemConfig[];
  mode?: MenuMode;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (key: string, item: MenuItemConfig) => void;
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;
  /** Inline mode only: icons-only rail whose submenus open in a popup. */
  inlineCollapsed?: boolean;
  /** Allow multiple selected rows. Defaults to false. */
  multiple?: boolean;
  /** When false, rows only trigger `onSelect`-less navigation. Defaults to true. */
  selectable?: boolean;
  size?: Size;
  classNames?: MenuClassNames;
  styles?: MenuStyles;
}

interface MenuContextValue {
  mode: MenuMode;
  collapsed: boolean;
  openKeys: string[];
  selectedKeys: string[];
  activeKey: string;
  classNames?: MenuClassNames;
  styles?: MenuStyles;
  rootRef: RefObject<HTMLUListElement | null>;
  setActiveKey: (key: string) => void;
  toggleSubmenu: (key: string, nextOpen?: boolean) => void;
  selectItem: (item: MenuItemConfig, event: MouseEvent<HTMLElement>) => void;
  onListKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error('yuki: Menu parts must be rendered inside <Menu>.');
  return context;
}

function firstEnabledKey(items: MenuItemConfig[]): string {
  for (const item of items) {
    if (item.type === 'divider') continue;
    if (item.type === 'group') {
      const nested = firstEnabledKey(item.children ?? []);
      if (nested) return nested;
      continue;
    }
    if (!item.disabled) return item.key;
  }
  return '';
}

function isPopupMode(mode: MenuMode, collapsed: boolean): boolean {
  return mode !== 'inline' || collapsed;
}

function itemRows(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
    (element) =>
      element.getAttribute('aria-disabled') !== 'true' && !element.closest('[hidden]'),
  );
}

function submenuTrigger(submenu: HTMLElement): HTMLElement | undefined {
  const list = submenu.querySelector<HTMLElement>('[data-slot="submenu-list"]');
  if (!list?.id) return undefined;
  return Array.from(submenu.ownerDocument.querySelectorAll<HTMLElement>('[aria-haspopup="menu"][aria-controls]'))
    .find((trigger) => trigger.getAttribute('aria-controls') === list.id);
}

/* -------------------------------------------------------------------------- */
/* Rows                                                                        */
/* -------------------------------------------------------------------------- */

function RowContent({ item }: { item: MenuItemConfig }) {
  const { classNames, styles } = useMenuContext();
  return (
    <>
      {item.icon != null && (
        <span
          aria-hidden="true"
          data-slot="item-icon"
          className={cx('yuki-menu__icon', classNames?.itemIcon)}
          style={styles?.itemIcon}
        >
          {item.icon}
        </span>
      )}
      <span
        data-slot="item-label"
        className={cx('yuki-menu__label', classNames?.itemLabel)}
        style={styles?.itemLabel}
      >
        {item.label}
      </span>
      {item.extra != null && (
        <span
          data-slot="item-extra"
          className={cx('yuki-menu__extra', classNames?.itemExtra)}
          style={styles?.itemExtra}
        >
          {item.extra}
        </span>
      )}
    </>
  );
}

function MenuDividerNode({ item }: { item: MenuItemConfig }) {
  const { classNames, styles } = useMenuContext();
  return (
    <li
      role="separator"
      data-slot="divider"
      data-menu-key={item.key}
      className={cx('yuki-menu__divider', classNames?.divider)}
      style={styles?.divider}
    />
  );
}

function MenuGroupNode({ item }: { item: MenuItemConfig }) {
  const { classNames, styles } = useMenuContext();
  const id = useId();
  return (
    <li
      role="presentation"
      data-slot="group"
      data-menu-key={item.key}
      className={cx('yuki-menu__group', classNames?.group)}
      style={styles?.group}
    >
      <div
        id={id}
        data-slot="group-title"
        className={cx('yuki-menu__group-title', classNames?.groupTitle)}
        style={styles?.groupTitle}
      >
        {item.label}
      </div>
      <ul role="group" aria-labelledby={id} className="yuki-menu__group-list">
        {(item.children ?? []).map((child) => (
          <MenuNode key={child.key} item={child} />
        ))}
      </ul>
    </li>
  );
}

function MenuItemNode({ item }: { item: MenuItemConfig }) {
  const { collapsed, selectedKeys, activeKey, classNames, styles, selectItem, setActiveKey } =
    useMenuContext();
  const selected = selectedKeys.includes(item.key);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.onClick?.({ key: item.key, item, event });
    if (!event.defaultPrevented) selectItem(item, event);
  };

  const rowProps = {
    'data-slot': 'item',
    'data-menu-key': item.key,
    'data-selected': selected || undefined,
    'data-danger': item.danger || undefined,
    role: 'menuitem',
    title: collapsed && typeof item.label === 'string' ? item.label : undefined,
    tabIndex: activeKey === item.key ? 0 : -1,
    'aria-disabled': item.disabled || undefined,
    className: cx('yuki-menu__item', classNames?.item),
    style: styles?.item,
    onFocus: () => setActiveKey(item.key),
  };

  return (
    <li role="none" data-slot="item-wrap" data-menu-key={item.key}>
      {item.href && !item.disabled ? (
        <a
          {...rowProps}
          href={item.href}
          aria-current={selected ? 'page' : undefined}
          onClick={handleClick as unknown as (event: MouseEvent<HTMLAnchorElement>) => void}
        >
          <RowContent item={item} />
        </a>
      ) : (
        <button type="button" {...rowProps} onClick={handleClick}>
          <RowContent item={item} />
        </button>
      )}
    </li>
  );
}

function MenuSubmenuNode({ item }: { item: MenuItemConfig }) {
  const {
    mode,
    collapsed,
    openKeys,
    activeKey,
    classNames,
    styles,
    setActiveKey,
    toggleSubmenu,
    onListKeyDown,
  } = useMenuContext();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const open = openKeys.includes(item.key);
  const popup = isPopupMode(mode, collapsed);

  const rows = (item.children ?? []).map((child) => <MenuNode key={child.key} item={child} />);

  return (
    <li
      role="none"
      data-slot="submenu"
      data-submenu-key={item.key}
      data-open={open || undefined}
      data-disabled={item.disabled || undefined}
      className={cx('yuki-menu__submenu', classNames?.submenu)}
      style={styles?.submenu}
    >
      <button
        ref={triggerRef}
        type="button"
        data-slot="submenu-trigger"
        data-menu-key={item.key}
        data-open={open || undefined}
        role="menuitem"
        aria-haspopup="menu"
        aria-controls={open ? listId : undefined}
        title={collapsed && typeof item.label === 'string' ? item.label : undefined}
        aria-expanded={open}
        aria-disabled={item.disabled || undefined}
        tabIndex={activeKey === item.key ? 0 : -1}
        className={cx(
          'yuki-menu__item',
          'yuki-menu__submenu-trigger',
          classNames?.item,
          classNames?.submenuTrigger,
        )}
        style={{ ...styles?.item, ...styles?.submenuTrigger }}
        onClick={(event) => {
          event.preventDefault();
          if (item.disabled) return;
          toggleSubmenu(item.key);
        }}
        onFocus={() => setActiveKey(item.key)}
      >
        <RowContent item={item} />
        <span
          aria-hidden="true"
          data-slot="submenu-arrow"
          className={cx('yuki-menu__arrow', classNames?.submenuArrow)}
          style={styles?.submenuArrow}
        />
      </button>
      {popup ? (
        <Popup
          open={open && !item.disabled}
          anchorRef={triggerRef}
          placement={mode === 'horizontal' ? 'bottom-start' : 'right-start'}
          offset={mode === 'horizontal' ? 4 : 8}
          role={undefined}
          className={cx('yuki-menu__submenu-popup', classNames?.popup)}
          style={styles?.popup}
          data-submenu-key={item.key}
          data-menu-popup=""
        >
          <ul
            id={listId}
            role="menu"
            aria-orientation="vertical"
            data-slot="submenu-list"
            className={cx('yuki-menu__submenu-list', classNames?.submenuList)}
            style={styles?.submenuList}
            onKeyDown={onListKeyDown}
          >
            {rows}
          </ul>
        </Popup>
      ) : (
        <ul
          id={listId}
          role="menu"
          aria-orientation="vertical"
          hidden={!open}
          data-slot="submenu-list"
          className={cx('yuki-menu__submenu-list', classNames?.submenuList)}
          style={styles?.submenuList}
        >
          {rows}
        </ul>
      )}
    </li>
  );
}

function MenuNode({ item }: { item: MenuItemConfig }) {
  if (item.type === 'divider') return <MenuDividerNode item={item} />;
  if (item.type === 'group') return <MenuGroupNode item={item} />;
  if (item.children && item.children.length > 0) return <MenuSubmenuNode item={item} />;
  return <MenuItemNode item={item} />;
}

/* -------------------------------------------------------------------------- */
/* Menu                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Accessible navigation menu. Renders a `menu` (or `menubar` when horizontal)
 * with roving tabindex, arrow / Home / End navigation and Escape to close the
 * deepest open submenu while returning focus to its trigger.
 */
export const Menu = forwardRef<HTMLUListElement, MenuProps>(function Menu(
  inputProps,
  ref,
) {
  const {
    items,
    mode = 'vertical',
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    onSelect,
    openKeys: openKeysProp,
    defaultOpenKeys,
    onOpenChange,
    inlineCollapsed = false,
    multiple = false,
    selectable = true,
    size: sizeProp,
    classNames,
    styles,
    className,
    style,
    onKeyDown,
    ...rest
  } = useComponentDefaults('Menu', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const rootRef = useRef<HTMLUListElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  const collapsed = mode === 'inline' && inlineCollapsed;

  const [selectedKeys, setSelectedKeys] = useControllableState<string[]>({
    value: selectedKeysProp,
    defaultValue: defaultSelectedKeys ?? [],
  });
  const [openKeys, setOpenKeys] = useControllableState<string[]>({
    value: openKeysProp,
    defaultValue: defaultOpenKeys ?? [],
    onChange: onOpenChange,
  });
  const [activeKey, setActiveKey] = useState(() => firstEnabledKey(items));

  const selectItem = useEventCallback((item: MenuItemConfig, event: MouseEvent<HTMLElement>) => {
    if (!selectable || item.disabled) return;
    const next = multiple
      ? selectedKeys.includes(item.key)
        ? selectedKeys.filter((key) => key !== item.key)
        : [...selectedKeys, item.key]
      : [item.key];
    setSelectedKeys(next);
    onSelect?.(item.key, item);
    if (isPopupMode(mode, collapsed)) {
      const popup = event.currentTarget.closest<HTMLElement>('[data-menu-popup]');
      if (popup) submenuTrigger(popup)?.focus();
      setOpenKeys([]);
    }
    event.stopPropagation();
  });

  const toggleSubmenu = useEventCallback((key: string, nextOpen?: boolean) => {
    const isOpen = openKeys.includes(key);
    const shouldOpen = nextOpen ?? !isOpen;
    if (!shouldOpen) {
      setOpenKeys(openKeys.filter((open) => open !== key));
      return;
    }
    setOpenKeys(mode === 'inline' && !collapsed ? [...openKeys, key] : [key]);
  });

  const closeSubmenu = useEventCallback((submenu: HTMLElement) => {
    const key = submenu.dataset.submenuKey;
    if (!key) return;
    toggleSubmenu(key, false);
    submenuTrigger(submenu)?.focus();
    setActiveKey(key);
  });

  const openSubmenu = useEventCallback((trigger: HTMLElement) => {
    const key = trigger.dataset.menuKey;
    if (!key) return;
    if (trigger.getAttribute('aria-expanded') !== 'true') toggleSubmenu(key, true);
    window.setTimeout(() => {
      const id = trigger.getAttribute('aria-controls');
      const list = id ? trigger.ownerDocument.getElementById(id) : null;
      const first = list && itemRows(list)[0];
      if (first) {
        first.focus();
        if (first.dataset.menuKey) setActiveKey(first.dataset.menuKey);
      }
    }, 0);
  });

  const onListKeyDown = useEventCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (!target.matches('[role="menuitem"]')) return;
    const scope = event.currentTarget as HTMLElement;
    const rows = itemRows(scope);
    const index = rows.indexOf(target);
    if (index === -1) return;

    const focusAt = (next: number) => {
      const element = rows[(next + rows.length) % rows.length];
      element?.focus();
    };

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(rows.length - 1);
        break;
      case 'ArrowRight':
        if (target.getAttribute('aria-haspopup') === 'menu') {
          event.preventDefault();
          openSubmenu(target);
        }
        break;
      case 'ArrowLeft': {
        const submenu = target.closest<HTMLElement>('[data-submenu-key]');
        if (submenu) {
          event.preventDefault();
          closeSubmenu(submenu);
        }
        break;
      }
      case 'Escape': {
        const submenu = target.closest<HTMLElement>('[data-submenu-key]');
        if (submenu) {
          event.preventDefault();
          closeSubmenu(submenu);
        } else if (openKeys.length > 0) {
          event.preventDefault();
          setOpenKeys([]);
        }
        break;
      }
      default:
        break;
    }
  });

  // Clicking anywhere outside the menu (and its floating submenus) closes popups.
  useEffect(() => {
    if (!isPopupMode(mode, collapsed) || openKeys.length === 0) return;
    const listener = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (target.closest('[data-menu-popup]')) return;
      setOpenKeys([]);
    };
    document.addEventListener('pointerdown', listener, true);
    return () => document.removeEventListener('pointerdown', listener, true);
  }, [mode, collapsed, openKeys.length, setOpenKeys]);

  const contextValue: MenuContextValue = {
    mode,
    collapsed,
    openKeys,
    selectedKeys,
    activeKey,
    classNames,
    styles,
    rootRef,
    setActiveKey,
    toggleSubmenu,
    selectItem,
    onListKeyDown,
  };

  return (
    <MenuContext.Provider value={contextValue}>
      <ul
        {...rest}
        ref={mergedRef}
        role={mode === 'horizontal' ? 'menubar' : 'menu'}
        aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
        aria-label={rest['aria-label'] ?? t('menu.label', { 'zh-CN': '菜单', 'en-US': 'Menu' })}
        data-slot="menu"
        data-mode={mode}
        data-size={size}
        data-collapsed={collapsed || undefined}
        className={cx('yuki-menu', classNames?.root, className)}
        style={{ ...styles?.root, ...style }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) onListKeyDown(event);
        }}
      >
        {items.map((item) => (
          <MenuNode key={item.key} item={item} />
        ))}
      </ul>
    </MenuContext.Provider>
  );
});

Menu.displayName = 'Menu';
