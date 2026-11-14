import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cx } from '../../internal/cx';
import { ComposedDropdown, type ComposedDropdownProps } from './ComposedDropdown';
import { Popup } from '../../internal/Popup';
import { useClickOutside, useControllableState, useEscapeKey, useMergedRefs } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import type { Placement } from '../../hooks';

export type DropdownTriggerMode = 'click' | 'hover';
export type DropdownItemType = 'item' | 'divider' | 'group';

export interface DropdownItemConfig {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** Right-aligned hint such as a shortcut. */
  extra?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  type?: DropdownItemType;
  href?: string;
  /** Nested items for `type: 'group'`. */
  children?: readonly DropdownItemConfig[];
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
}

export interface DropdownClassNames {
  trigger?: string;
  popup?: string;
  list?: string;
  item?: string;
  itemIcon?: string;
  itemLabel?: string;
  itemExtra?: string;
  divider?: string;
  group?: string;
  groupTitle?: string;
}

export interface DropdownStyles {
  trigger?: StyleProperties;
  popup?: StyleProperties;
  list?: StyleProperties;
  item?: StyleProperties;
  itemIcon?: StyleProperties;
  itemLabel?: StyleProperties;
  itemExtra?: StyleProperties;
  divider?: StyleProperties;
  group?: StyleProperties;
  groupTitle?: StyleProperties;
}

export interface ItemsDropdownProps
  extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'children' | 'onSelect'> {
  /** The trigger element; it receives the ARIA menu wiring. */
  trigger: ReactElement;
  children?: never;
  items: readonly DropdownItemConfig[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerMode?: DropdownTriggerMode;
  placement?: Placement;
  disabled?: boolean;
  arrow?: boolean;
  /** Close after choosing an item. */
  closeOnSelect?: boolean;
  size?: Size;
  onSelect?: (key: string, item: DropdownItemConfig, event: ReactMouseEvent<HTMLElement>) => void;
  classNames?: DropdownClassNames;
  styles?: DropdownStyles;
}

export type DropdownProps = ItemsDropdownProps | (ComposedDropdownProps & { items?: never });

const CLOSE_DELAY = 120;

/**
 * Menu surfaced from a trigger element. Built on `internal/Popup` + `useFloating`,
 * so the menu flips and shifts inside the viewport.
 */
const ItemsDropdown = forwardRef<HTMLSpanElement, ItemsDropdownProps>(function ItemsDropdown(
  inputProps,
  ref,
) {
  const {
    trigger,
    items,
    open,
    defaultOpen = false,
    onOpenChange,
    triggerMode = 'click',
    placement = 'bottom-start',
    disabled = false,
    arrow = false,
    closeOnSelect = true,
    size: sizeProp,
    onSelect,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = inputProps;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const pendingFocus = useRef<1 | -1 | null>(null);
  const focusFrame = useRef<number | undefined>(undefined);

  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const visible = isOpen && !disabled;

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const requestClose = (restoreFocus = false) => {
    clearCloseTimer();
    pendingFocus.current = null;
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  };

  useEffect(() => clearCloseTimer, []);

  useEffect(() => {
    if (!isOpen) clearCloseTimer();
  }, [isOpen]);

  useEscapeKey((event) => {
    event.preventDefault();
    requestClose(true);
  }, visible);

  useClickOutside([rootRef, popupRef], () => requestClose(), visible);

  const focusItem = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const nodes = Array.from(
      list.querySelectorAll<HTMLElement>('[data-slot="dropdown-item"]:not([aria-disabled="true"])'),
    );
    if (nodes.length === 0) return;
    const current = nodes.indexOf(document.activeElement as HTMLElement);
    const next =
      current === -1
        ? direction === 1
          ? 0
          : nodes.length - 1
        : (current + direction + nodes.length) % nodes.length;
    nodes[next]?.focus();
  };

  const attachList = (node: HTMLUListElement | null) => {
    listRef.current = node;
    if (focusFrame.current !== undefined) cancelAnimationFrame(focusFrame.current);
    if (node && pendingFocus.current !== null) {
      // Popup stays visibility:hidden until its layout effect positions it.
      focusFrame.current = requestAnimationFrame(() => {
        if (pendingFocus.current !== null) focusItem(pendingFocus.current);
        pendingFocus.current = null;
      });
    }
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(-1);
        break;
      case 'Home':
        event.preventDefault();
        listRef.current
          ?.querySelector<HTMLElement>('[data-slot="dropdown-item"]:not([aria-disabled="true"])')
          ?.focus();
        break;
      case 'End': {
        event.preventDefault();
        const nodes = listRef.current?.querySelectorAll<HTMLElement>(
          '[data-slot="dropdown-item"]:not([aria-disabled="true"])',
        );
        nodes?.[nodes.length - 1]?.focus();
        break;
      }
      case 'Escape':
        event.preventDefault();
        requestClose(true);
        break;
      case 'Tab':
        requestClose(false);
        break;
      default:
        break;
    }
  };

  const selectItem = (
    item: DropdownItemConfig,
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    if (item.disabled || item.type === 'divider' || item.type === 'group') return;
    item.onClick?.(event);
    if (event.defaultPrevented) return;
    onSelect?.(item.key, item, event);
    if (closeOnSelect && !event.defaultPrevented) {
      // A selected command may have moved focus into another surface.
      requestClose(Boolean(listRef.current?.contains(document.activeElement)));
    }
  };

  const openWithKeyboard = (event: ReactKeyboardEvent<HTMLElement>) => {
    event.preventDefault();
    pendingFocus.current = event.key === 'ArrowUp' ? -1 : 1;
    setOpen(true);
  };

  const triggerProps: WithStyle<HTMLAttributes<HTMLElement>> & {
    'data-state'?: string;
  } = {
    'aria-haspopup': 'menu',
    'aria-expanded': visible,
    'aria-disabled': disabled || undefined,
    'aria-controls': visible ? menuId : undefined,
    'data-state': visible ? 'open' : 'closed',
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      if (disabled || event.defaultPrevented || triggerMode !== 'click') return;
      setOpen(!isOpen);
    },
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      if (disabled || event.defaultPrevented) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!isOpen) {
          openWithKeyboard(event);
        } else {
          event.preventDefault();
          focusItem(event.key === 'ArrowDown' ? 1 : -1);
        }
      } else if ((event.key === 'Enter' || event.key === ' ') && !isOpen) {
        if (triggerMode === 'click') {
          openWithKeyboard(event);
        }
      } else if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        requestClose(true);
      }
    },
    onMouseEnter: (event: ReactMouseEvent<HTMLElement>) => {
      if (disabled || event.defaultPrevented || triggerMode !== 'hover') return;
      clearCloseTimer();
      setOpen(true);
    },
    onMouseLeave: (event: ReactMouseEvent<HTMLElement>) => {
      if (disabled || event.defaultPrevented || triggerMode !== 'hover') return;
      scheduleClose();
    },
  };

  const renderItems = (nodes: readonly DropdownItemConfig[]): ReactNode =>
    nodes.map((item) => {
      if (item.type === 'divider') {
        return (
          <li
            key={item.key}
            role="separator"
            className={cx('yuki-dropdown__divider', classNames?.divider)}
            style={styles?.divider}
            data-slot="dropdown-divider"
          />
        );
      }

      if (item.type === 'group') {
        return (
          <li key={item.key} role="presentation" data-slot="dropdown-group">
            <div
              className={cx('yuki-dropdown__group-title', classNames?.groupTitle)}
              style={styles?.groupTitle}
              data-slot="dropdown-group-title"
            >
              {item.label}
            </div>
            <ul
              role="group"
              aria-label={typeof item.label === 'string' ? item.label : undefined}
              className={cx('yuki-dropdown__group', classNames?.group)}
              style={styles?.group}
              data-slot="dropdown-group-list"
            >
              {renderItems(item.children ?? [])}
            </ul>
          </li>
        );
      }

      const content = (
        <>
          {item.icon ? (
            <span
              className={cx('yuki-dropdown__icon', classNames?.itemIcon)}
              style={styles?.itemIcon}
              data-slot="dropdown-item-icon"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          ) : null}
          <span
            className={cx('yuki-dropdown__label', classNames?.itemLabel)}
            style={styles?.itemLabel}
            data-slot="dropdown-item-label"
          >
            {item.label}
          </span>
          {item.extra ? (
            <span
              className={cx('yuki-dropdown__extra', classNames?.itemExtra)}
              style={styles?.itemExtra}
              data-slot="dropdown-item-extra"
            >
              {item.extra}
            </span>
          ) : null}
        </>
      );

      const itemClass = cx(
        'yuki-dropdown__item',
        classNames?.item,
        item.danger && 'yuki-dropdown__item--danger',
        item.disabled && 'yuki-dropdown__item--disabled',
      );
      const itemProps = {
        className: itemClass,
        style: styles?.item,
        role: 'menuitem',
        tabIndex: -1,
        'aria-disabled': item.disabled ? true : undefined,
        'data-slot': 'dropdown-item',
        'data-menu-key': item.key,
        'data-danger': item.danger ? '' : undefined,
        onMouseEnter: () => clearCloseTimer(),
      };

      const handler = (event: ReactMouseEvent<HTMLElement>) => {
        if (item.disabled) {
          event.preventDefault();
          return;
        }
        selectItem(item, event);
      };

      return (
        <li key={item.key} role="none" data-slot="dropdown-item-wrap" data-menu-key={item.key}>
          {item.href ? (
            <a {...itemProps} href={item.href} onClick={handler}>
              {content}
            </a>
          ) : (
            <button {...itemProps} type="button" onClick={handler}>
              {content}
            </button>
          )}
        </li>
      );
    });

  const mergedRootRef = useMergedRefs<HTMLSpanElement>(rootRef, ref);

  return (
    <span
      {...rest}
      ref={mergedRootRef}
      className={cx('yuki-dropdown', classNames?.trigger, className)}
      style={{ ...styles?.trigger, ...style }}
      data-slot="dropdown"
      data-size={size}
      data-state={visible ? 'open' : 'closed'}
    >
      <Slot {...triggerProps} ref={triggerRef}>{trigger}</Slot>
      <Popup
        open={visible}
        anchorRef={triggerRef}
        placement={placement}
        arrow={arrow}
        className={cx('yuki-dropdown__popup', classNames?.popup)}
        style={styles?.popup}
        onMouseEnter={triggerMode === 'hover' ? clearCloseTimer : undefined}
        onMouseLeave={triggerMode === 'hover' ? scheduleClose : undefined}
      >
        <div ref={popupRef} className="yuki-dropdown__panel">
          <ul
            ref={attachList}
            id={menuId}
            role="menu"
            aria-label={t('dropdown.label', { 'zh-CN': '下拉菜单', 'en-US': 'Dropdown menu' })}
            aria-orientation="vertical"
            className={cx('yuki-dropdown__list', classNames?.list)}
            style={styles?.list}
            data-slot="dropdown-list"
            onKeyDown={handleListKeyDown}
          >
            {renderItems(items)}
          </ul>
        </div>
      </Popup>
    </span>
  );
});

export const Dropdown: {
  (props: (ItemsDropdownProps & RefAttributes<HTMLSpanElement>) | (ComposedDropdownProps & { items?: never })): ReactNode;
  displayName?: string;
} = forwardRef<HTMLSpanElement, DropdownProps>(function Dropdown(input, ref) {
  const props = useComponentDefaults('Dropdown', input);
  if (props.items !== undefined) return <ItemsDropdown {...props} ref={ref} />;
  return <ComposedDropdown {...props} />;
});

Dropdown.displayName = 'Dropdown';
