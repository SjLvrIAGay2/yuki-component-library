import type { StyleProperties, WithStyle } from '../styles/properties';
import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx } from './cx';
import { Portal } from './Portal';
import { useFloating, type Placement } from '../hooks/useFloating';
import { useMergedRefs } from '../hooks/useMergedRefs';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export interface PopupProps {
  open: boolean;
  /** Preserve panel state while closing it to pointer, focus and accessibility. */
  forceMount?: boolean;
  container?: HTMLElement | null;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: Placement;
  offset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  surfaceProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  arrowProps?: WithStyle<HTMLAttributes<HTMLSpanElement>> & { width?: number | string; height?: number | string };
  matchAnchorWidth?: boolean | 'minimum';
  arrow?: boolean;
  arrowClassName?: string;
  arrowStyle?: StyleProperties;
  /** ARIA role for the floating surface (tooltip, dialog, listbox, menu…). */
  role?: string;
  id?: string;
  className?: string;
  style?: StyleProperties;
  children?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void;
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
}

/**
 * Shared floating surface: portal + fixed positioning + flip/shift + enter
 * animation. Higher-level overlays (Tooltip, Popover, Dropdown, Select…) build
 * on this so positioning and layering stay in one place.
 */
export const Popup = forwardRef<HTMLDivElement, PopupProps>(function Popup(
  {
    open,
    forceMount,
    container,
    anchorRef,
    placement = 'bottom',
    offset = 8,
    alignOffset = 0,
    avoidCollisions = true,
    surfaceProps,
    arrowProps,
    matchAnchorWidth = false,
    arrow = false,
    arrowClassName,
    arrowStyle,
    role,
    id,
    className,
    style,
    children,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...aria
  },
  ref,
) {
  const floatingRef = useRef<HTMLDivElement>(null);
  // Portal children mount one commit after `open` flips; keep the node in state
  // so positioning can measure it and re-render without an extra frame.
  const [floatingNode, setFloatingNode] = useState<HTMLDivElement | null>(null);
  // A portal no longer inherits component-level tokens from the trigger (for
  // example, Cascader's column width and Select's row height). Carry only the
  // variables whose value differs from the portal host, leaving the popup's own
  // stylesheet and the caller's inline overrides in control.
  const [inherited, setInherited] = useState<CSSProperties>({});
  useIsomorphicLayoutEffect(() => {
    const anchor = anchorRef.current;
    const host = floatingNode?.parentElement;
    if (!open || !anchor || !host) return;
    const sync = () => {
      const source = getComputedStyle(anchor);
      const target = getComputedStyle(host);
      const vars: Record<string, string> = {};
      for (const key of Array.from(source)) {
        if (!key.startsWith('--yuki-')) continue;
        const value = source.getPropertyValue(key);
        if (value !== target.getPropertyValue(key)) vars[key] = value;
      }
      setInherited(vars as CSSProperties);
    };
    sync();
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(sync);
    for (let el: HTMLElement | null = anchor; el; el = el.parentElement) {
      observer.observe(el, { attributes: true, attributeFilter: ['class', 'style', 'data-size', 'data-yuki-theme', 'data-yuki-density'] });
    }
    return () => observer.disconnect();
  }, [open, anchorRef, floatingNode]);
  const mergedRef = useMergedRefs(floatingRef, ref, setFloatingNode);
  const {
    floatingStyles,
    arrowStyles,
    actualPlacement,
    isPositioned,
    update,
    measure,
  } = useFloating({
    open,
    anchorRef,
    floatingRef,
    placement,
    offset,
    alignOffset,
    matchAnchorWidth,
    flip: avoidCollisions,
    shift: avoidCollisions,
  });

  useIsomorphicLayoutEffect(() => {
    if (open && floatingNode && !isPositioned) measure();
  }, [open, floatingNode, isPositioned, measure]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !floatingNode || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => update());
    observer.observe(floatingNode);
    return () => observer.disconnect();
  }, [open, floatingNode, update]);

  if (!open && !forceMount) return null;

  return (
    <Portal container={container} anchorRef={anchorRef}>
      <div
        {...surfaceProps}
        {...aria}
        ref={mergedRef}
        id={id ?? surfaceProps?.id}
        role={role ?? surfaceProps?.role}
        data-slot="popup"
        hidden={!open || surfaceProps?.hidden}
        aria-hidden={open ? surfaceProps?.['aria-hidden'] : true}
        data-placement={actualPlacement}
        data-side={actualPlacement.split('-')[0]}
        className={cx('yuki-popup', open && 'yuki-popup--animated', !open && 'yuki-force-hidden', className, surfaceProps?.className)}
        style={{ ...inherited, ...floatingStyles, ...style, ...surfaceProps?.style }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus ?? surfaceProps?.onFocus}
        onBlur={onBlur ?? surfaceProps?.onBlur}
      >
        {children}
        {arrow && (
          <span
            {...arrowProps}
            aria-hidden="true"
            data-slot="arrow"
            className={cx('yuki-popup__arrow', arrowClassName, arrowProps?.className)}
            style={{ ...arrowStyles, ...arrowStyle, width: arrowProps?.width, height: arrowProps?.height, ...arrowProps?.style }}
          />
        )}
      </div>
    </Portal>
  );
});

Popup.displayName = 'Popup';
