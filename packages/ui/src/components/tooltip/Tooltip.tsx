import { useConfig, useComponentDefaults, usePortalTheme } from '../../theme';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAnimation, usePresence, type AnimationOptions } from '../../animation';
import { inertValue } from '../../internal/inert';
import { cx } from '../../internal/cx';
import { Popup } from '../../internal/Popup';
import { useControllableState, useEscapeKey } from '../../hooks';
import type { Placement } from '../../hooks';

export interface TooltipClassNames {
  root?: string;
  popup?: string;
  arrow?: string;
}

export interface TooltipStyles {
  root?: CSSProperties;
  popup?: CSSProperties;
  arrow?: CSSProperties;
}

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content' | 'title'> {
  content: ReactNode;
  placement?: Placement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  hideArrow?: boolean;
  animation?: AnimationOptions | false;
  delayDuration?: number;
  providerProps?: {
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
  };
  portalContainer?: HTMLElement | null;
  portalProps?: { container?: HTMLElement | null; forceMount?: boolean };
  arrowProps?: HTMLAttributes<HTMLSpanElement> & {
    width?: number | string;
    height?: number | string;
  };
  contentProps?: HTMLAttributes<HTMLDivElement> & {
    forceMount?: boolean;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    alignOffset?: number;
    avoidCollisions?: boolean;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
  };
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  arrow?: boolean;
  offset?: number;
  disabled?: boolean;
  /** ms before opening on hover. */
  openDelay?: number;
  /** ms before closing after the pointer leaves. */
  closeDelay?: number;
  classNames?: TooltipClassNames;
  styles?: TooltipStyles;
  children: ReactNode;
}

/** Short, non-interactive hint shown on hover or keyboard focus. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(inputProps, ref) {
  const {
    content,
    side,
    placement: requestedPlacement,
    hideArrow,
    animation,
    portalContainer,
    portalProps,
    contentProps,
    arrowProps,
    providerProps,
    delayDuration,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    arrow = !hideArrow,
    offset = contentProps?.sideOffset ?? 8,
    disabled = false,
    openDelay = delayDuration ?? providerProps?.delayDuration ?? 200,
    closeDelay = 100,
    classNames,
    styles,
    className,
    style,
    children,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  } = useComponentDefaults('Tooltip', inputProps);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const generatedId = useId();
  const id = contentProps?.id ?? generatedId;
  const {
    side: nestedSide,
    align,
    sideOffset,
    alignOffset,
    avoidCollisions,
    onEscapeKeyDown,
    forceMount,
    ...surface
  } = contentProps ?? {};
  const chosenSide = side ?? nestedSide ?? 'top';
  const placement =
    requestedPlacement ??
    (align && align !== 'center' ? (`${chosenSide}-${align}` as Placement) : chosenSide);
  const container = portalContainer !== undefined ? portalContainer : portalProps?.container;
  const theme = usePortalTheme();
  const visible = open && !disabled;
  const lastClose = useRef(-Infinity);
  useEffect(() => {
    if (visible)
      return () => {
        lastClose.current = performance.now();
      };
  }, [visible]);

  const { duration, delay, ...motion } = useAnimation(animation, 'fade');
  const customMotion = useConfig().animation !== undefined || animation !== undefined;
  const present = usePresence(visible, customMotion ? duration : 0, customMotion ? delay : 0);
  const forced = !!(forceMount || portalProps?.forceMount);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (next: boolean, delay: number) => {
      clearTimer();
      if (delay <= 0) {
        setOpen(next);
        return;
      }
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setOpen(next);
      }, delay);
    },
    [clearTimer, setOpen],
  );

  useEffect(() => clearTimer, [clearTimer]);

  useEscapeKey((event) => {
    onEscapeKeyDown?.(event);
    if (event.defaultPrevented) return;
    clearTimer();
    setOpen(false);
  }, visible);

  const child = Children.only(children);
  const describedBy = isValidElement<{ 'aria-describedby'?: string }>(child)
    ? child.props['aria-describedby']
    : undefined;
  const triggerNode = isValidElement(child)
    ? cloneElement(child as ReactElement<Record<string, unknown>>, {
        'aria-describedby': [describedBy, visible && id].filter(Boolean).join(' ') || undefined,
      })
    : child;

  return (
    <span
      {...rest}
      ref={ref}
      data-slot="tooltip"
      data-state={visible ? 'open' : 'closed'}
      className={cx('yuki-tooltip', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (disabled || event.defaultPrevented) return;
        const skipDelay = providerProps?.skipDelayDuration ?? 0;
        schedule(true, performance.now() - lastClose.current < skipDelay ? 0 : openDelay);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        if (disabled || event.defaultPrevented) return;
        schedule(false, closeDelay);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (disabled || event.defaultPrevented) return;
        schedule(true, 0);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (disabled || event.defaultPrevented) return;
        schedule(false, 0);
      }}
    >
      <span ref={anchorRef} className="yuki-tooltip__anchor">
        {triggerNode}
      </span>
      <Popup
        id={id}
        open={visible || (!forced && present)}
        forceMount={forced}
        container={container}
        surfaceProps={{
          ...(container ? theme : undefined),
          ...(customMotion ? motion : undefined),
          ...surface,
          className: cx(
            container && theme.className,
            customMotion && motion.className,
            surface.className,
          ),
          style: {
            ...(container && theme.style),
            ...(customMotion && motion.style),
            ...surface.style,
          },
          'aria-hidden': !visible || surface['aria-hidden'],
          inert: inertValue(!visible || surface.inert),
        }}
        data-state={visible ? 'open' : 'closed'}
        avoidCollisions={avoidCollisions}
        alignOffset={alignOffset}
        arrowProps={arrowProps}
        anchorRef={anchorRef}
        placement={placement}
        offset={offset}
        arrow={arrow}
        role="tooltip"
        className={cx('yuki-tooltip__popup', classNames?.popup)}
        style={styles?.popup}
        arrowClassName={classNames?.arrow}
        arrowStyle={styles?.arrow}
        onMouseEnter={(event) => {
          surface.onMouseEnter?.(event);
          if (!disabled && !event.defaultPrevented && !providerProps?.disableHoverableContent)
            clearTimer();
        }}
        onMouseLeave={(event) => {
          surface.onMouseLeave?.(event);
          if (!disabled && !event.defaultPrevented) schedule(false, closeDelay);
        }}
      >
        {content}
      </Popup>
    </span>
  );
});

Tooltip.displayName = 'Tooltip';
