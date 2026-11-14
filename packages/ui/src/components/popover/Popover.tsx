import type { StyleProperties, WithStyle } from '../../styles/properties';
import { useComponentDefaults } from '../../theme';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { Popup } from '../../internal/Popup';
import { useClickOutside, useControllableState, useEscapeKey } from '../../hooks';
import type { Placement } from '../../hooks';

export type PopoverTrigger = 'click' | 'hover' | 'focus';

export interface PopoverClassNames {
  root?: string;
  popup?: string;
  arrow?: string;
  title?: string;
  content?: string;
}

export interface PopoverStyles {
  root?: StyleProperties;
  popup?: StyleProperties;
  arrow?: StyleProperties;
  title?: StyleProperties;
  content?: StyleProperties;
}

export interface PopoverProps
  extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'content' | 'title' | 'onChange'> {
  content?: ReactNode;
  title?: ReactNode;
  /** Interaction that opens the popup. Defaults to `click`. */
  trigger?: PopoverTrigger | ReactElement;
  portalContainer?: HTMLElement | null;
  side?: Placement;
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  arrow?: boolean;
  offset?: number;
  disabled?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  classNames?: PopoverClassNames;
  styles?: PopoverStyles;
  children?: ReactNode;
}

/** Click/hover/focus triggered floating panel for rich, interactive content. */
export const Popover = forwardRef<HTMLSpanElement, PopoverProps>(function Popover(
  inputProps,
  ref,
) {
  const {
    content,
    title,
    trigger: triggerProp = 'click',
    side, placement = side ?? 'bottom', portalContainer,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    arrow = true,
    offset = 8,
    disabled = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    classNames,
    styles,
    className,
    style,
    children,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onClick,
    ...rest
  } = useComponentDefaults('Popover', inputProps);
  const trigger = typeof triggerProp === 'string' ? triggerProp : 'click';
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = useId();
  const visible = open && !disabled;

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(
    (delay = 120) => {
      clearCloseTimer();
      closeTimer.current = window.setTimeout(() => {
        closeTimer.current = null;
        setOpen(false);
      }, delay);
    },
    [clearCloseTimer, setOpen],
  );

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  useClickOutside(
    [anchorRef, popupRef],
    () => setOpen(false),
    visible && trigger === 'click' && closeOnOutsideClick,
  );
  useEscapeKey(() => setOpen(false), visible && closeOnEscape);

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>) => {
    onMouseLeave?.(event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLSpanElement>) => {
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    onBlur?.(event);
  };

  // Trigger interactions are bound to the anchor only. Binding them to the
  // wrapper would let clicks inside portaled, interactive content bubble back
  // into the trigger and immediately close the popover.
  const handleTriggerClick = () => {
    if (disabled || trigger !== 'click') return;
    setOpen(!open);
  };

  const handleTriggerMouseEnter = () => {
    if (disabled || trigger !== 'hover') return;
    clearCloseTimer();
    setOpen(true);
  };

  const handleTriggerMouseLeave = () => {
    if (disabled || trigger !== 'hover') return;
    scheduleClose();
  };

  const handleTriggerFocus = () => {
    if (disabled || trigger !== 'focus') return;
    clearCloseTimer();
    setOpen(true);
  };

  const handleTriggerBlur = () => {
    if (disabled || trigger !== 'focus') return;
    scheduleClose();
  };

  const child = Children.only(typeof triggerProp === 'string' ? children : triggerProp);
  const triggerNode = isValidElement(child)
    ? cloneElement(child as ReactElement<Record<string, unknown>>, {
        'aria-haspopup': 'dialog',
        'aria-expanded': visible,
        'aria-controls': visible ? id : undefined,
      })
    : child;

  return (
    <span
      {...rest}
      ref={ref}
      data-slot="popover"
      data-state={visible ? 'open' : 'closed'}
      data-trigger={trigger}
      className={cx('yuki-popover', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span
        ref={anchorRef}
        className="yuki-popover__anchor"
        onClick={handleTriggerClick}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
        onFocus={handleTriggerFocus}
        onBlur={handleTriggerBlur}
      >
        {triggerNode}
      </span>
      <Popup
        ref={popupRef}
        id={id}
        container={portalContainer}
        open={visible}
        anchorRef={anchorRef}
        placement={placement}
        offset={offset}
        arrow={arrow}
        role="dialog"
        className={classNames?.popup}
        style={styles?.popup}
        arrowClassName={classNames?.arrow}
        arrowStyle={styles?.arrow}
        onMouseEnter={() => {
          if (trigger === 'hover') clearCloseTimer();
        }}
        onMouseLeave={() => {
          if (trigger === 'hover') scheduleClose();
        }}
        onFocus={() => {
          if (trigger === 'focus') clearCloseTimer();
        }}
        onBlur={() => {
          if (trigger === 'focus') scheduleClose();
        }}
      >
        <div className="yuki-popover__body">
          {title != null && (
            <div
              data-slot="title"
              className={cx('yuki-popover__title', classNames?.title)}
              style={styles?.title}
            >
              {title}
            </div>
          )}
          <div
            data-slot="content"
            className={cx('yuki-popover__content', classNames?.content)}
            style={styles?.content}
          >
            {content ?? (typeof triggerProp === 'string' ? null : children)}
          </div>
        </div>
      </Popup>
    </span>
  );
});

Popover.displayName = 'Popover';
