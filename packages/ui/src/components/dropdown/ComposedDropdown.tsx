import type { WithStyle } from '../../styles/properties';
import { useIsomorphicLayoutEffect } from '../../internal/useIsomorphicLayoutEffect';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as Primitive from '@radix-ui/react-dropdown-menu';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cx } from '../../internal/cx';
import { inertValue } from '../../internal/inert';
import { useExitBounds } from '../../internal/exit-bounds';
import { useConfig, usePortalTheme } from '../../theme';
import { useAnimation, usePresence, type AnimationOptions } from '../../animation';

const PassiveMenuContext = createContext(false);
export interface ComposedDropdownProps extends ComponentPropsWithoutRef<typeof Primitive.Root> {
  trigger: ReactElement;
  align?: 'start' | 'center' | 'end';
  className?: string;
  portalContainer?: HTMLElement | null;
  portalProps?: Omit<ComponentPropsWithoutRef<typeof Primitive.Portal>, 'children'>;
  contentProps?: Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Content>>, 'children' | 'asChild'>;
  animation?: AnimationOptions | false;
}
export function ComposedDropdown(input: ComposedDropdownProps) {
  const {
    trigger,
    children,
    align,
    className,
    portalContainer,
    portalProps,
    contentProps,
    animation,
    open,
    defaultOpen = false,
    onOpenChange,
    modal = true,
    ...props
  } = input;
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = open ?? uncontrolled;
  const forced = !!(portalProps?.forceMount || contentProps?.forceMount);
  const portalTheme = usePortalTheme();
  const { getPopupContainer } = useConfig();
  const { duration, delay, ...motion } = useAnimation(animation, 'fade');
  const present = usePresence(isOpen, duration, delay);
  const exit = useExitBounds(isOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useCallback((node: HTMLDivElement | null) => exit.ref(node), [exit.ref]);
  const openRef = useRef(isOpen);
  const focusActive = useRef(false);
  const interactedOutside = useRef(false);
  openRef.current = isOpen;
  const closeFocus = (event: Event) => {
    if (openRef.current || !focusActive.current) {
      event.preventDefault();
      return;
    }
    focusActive.current = false;
    contentProps?.onCloseAutoFocus?.(event);
    if (!event.defaultPrevented && forced) {
      event.preventDefault();
      if (modal || !interactedOutside.current) triggerRef.current?.focus();
    }
  };
  useEffect(
    () => () => {
      openRef.current = false;
    },
    [],
  );
  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      const entering = !focusActive.current;
      focusActive.current = true;
      if (entering) interactedOutside.current = false;
    }
  });
  const {
    forceMount: _forceMount,
    onCloseAutoFocus: _onCloseAutoFocus,
    onEscapeKeyDown: _onEscapeKeyDown,
    onPointerDownOutside: _onPointerDownOutside,
    onFocusOutside: _onFocusOutside,
    onInteractOutside: _onInteractOutside,
    loop: _loop,
    side: _side,
    sideOffset: _sideOffset,
    align: _align,
    alignOffset: _alignOffset,
    avoidCollisions: _avoidCollisions,
    collisionBoundary: _collisionBoundary,
    collisionPadding: _collisionPadding,
    sticky: _sticky,
    hideWhenDetached: _hideWhenDetached,
    updatePositionStrategy: _updatePositionStrategy,
    arrowPadding: _arrowPadding,
    ...closedContentProps
  } = contentProps ?? {};
  return (
    <Primitive.Root
      {...props}
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) exit.capture();
        if (open === undefined) setUncontrolled(next);
        onOpenChange?.(next);
      }}
      modal={modal}
    >
      <Primitive.Trigger asChild ref={triggerRef}>
        {trigger}
      </Primitive.Trigger>
      {(present || forced) && (
        <Primitive.Portal
          {...portalProps}
          container={portalContainer ?? portalProps?.container ?? getPopupContainer(triggerRef.current)}
          forceMount
        >
          {!isOpen ? (
            <div
              {...closedContentProps}
              {...portalTheme}
              {...motion}
              role="menu"
              data-state="closed"
              hidden={forced || !exit.bounds || undefined}
              inert={inertValue(true)}
              aria-hidden="true"
              className={cx(
                portalTheme.className,
                'yuki-dropdown-menu',
                motion.className,
                className,
                contentProps?.className,
              )}
              style={{
                ...portalTheme.style,
                ...motion.style,
                ...contentProps?.style,
                ...exit.bounds,
              }}
            >
              <PassiveMenuContext.Provider value>{children}</PassiveMenuContext.Provider>
            </div>
          ) : (
            <Primitive.Content
              {...contentProps}
              {...portalTheme}
              {...motion}
              ref={contentRef}
              align={align ?? contentProps?.align ?? 'end'}
              sideOffset={contentProps?.sideOffset ?? 6}
              className={cx(
                portalTheme.className,
                'yuki-dropdown-menu',
                motion.className,
                className,
                contentProps?.className,
              )}
              style={{ ...portalTheme.style, ...motion.style, ...contentProps?.style }}
              hidden={contentProps?.hidden || (forced && !isOpen) || undefined}
              inert={inertValue(!isOpen || undefined)}
              aria-hidden={!isOpen || contentProps?.['aria-hidden']}
              onCloseAutoFocus={closeFocus}
              onInteractOutside={(event) => {
                contentProps?.onInteractOutside?.(event);
                if (
                  !event.defaultPrevented &&
                  openRef.current &&
                  !(event.target instanceof Node && triggerRef.current?.contains(event.target))
                )
                  interactedOutside.current = true;
              }}
            >
              {children}
            </Primitive.Content>
          )}
        </Primitive.Portal>
      )}
    </Primitive.Root>
  );
}
export interface DropdownItemProps extends WithStyle<ComponentPropsWithoutRef<typeof Primitive.Item>> {
  destructive?: boolean;
  icon?: ReactNode;
  shortcut?: string;
  textProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  shortcutProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
}
export const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  function DropdownItem(
    {
      destructive,
      icon,
      shortcut,
      textProps,
      shortcutProps,
      children,
      className,
      asChild,
      disabled,
      onSelect,
      textValue,
      ...props
    },
    ref,
  ) {
    const passive = useContext(PassiveMenuContext);
    const itemProps: WithStyle<HTMLAttributes<HTMLDivElement>> = {
      ...props,
      className: cx('yuki-dropdown-menu-item', destructive && 'yuki-dropdown-menu-item--danger', className),
      onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        props.onClickCapture?.(event);
      },
      onKeyDownCapture: (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        props.onKeyDownCapture?.(event);
      },
    };
    if (passive) {
      const Component = asChild ? Slot : 'div';
      return (
        <Component
          {...itemProps}
          ref={ref}
          role="menuitem"
          data-disabled={disabled ? '' : undefined}
          aria-disabled={disabled || undefined}
        >
          {icon}
          {asChild ? (
            <Slottable child={children}>
              {(content) => <span {...textProps}>{content}</span>}
            </Slottable>
          ) : (
            <span {...textProps}>{children}</span>
          )}
          {shortcut && (
            <span {...shortcutProps} className={cx('yuki-dropdown-menu-shortcut', shortcutProps?.className)}>
              {shortcut}
            </span>
          )}
        </Component>
      );
    }
    return (
      <Primitive.Item
        {...itemProps}
        asChild={asChild}
        disabled={disabled}
        onSelect={onSelect}
        textValue={textValue}
        ref={ref}
      >
        {icon}
        {asChild ? (
          <Slottable child={children}>
            {(content) => <span {...textProps}>{content}</span>}
          </Slottable>
        ) : (
          <span {...textProps}>{children}</span>
        )}
        {shortcut && (
          <span {...shortcutProps} className={cx('yuki-dropdown-menu-shortcut', shortcutProps?.className)}>
            {shortcut}
          </span>
        )}
      </Primitive.Item>
    );
  },
);
export const DropdownLabel = forwardRef<
  HTMLDivElement,
  WithStyle<ComponentPropsWithoutRef<typeof Primitive.Label>>
>(function DropdownLabel({ className, ...props }, ref) {
  if (useContext(PassiveMenuContext)) {
    const { asChild, ...nativeProps } = props;
    const Component = asChild ? Slot : 'div';
    return <Component {...nativeProps} ref={ref} className={cx('yuki-dropdown-menu-label', className)} />;
  }
  return <Primitive.Label {...props} ref={ref} className={cx('yuki-dropdown-menu-label', className)} />;
});
export const DropdownSeparator = forwardRef<
  HTMLDivElement,
  WithStyle<ComponentPropsWithoutRef<typeof Primitive.Separator>>
>(function DropdownSeparator({ className, ...props }, ref) {
  if (useContext(PassiveMenuContext)) {
    const { asChild, ...nativeProps } = props;
    const Component = asChild ? Slot : 'div';
    return (
      <Component
        {...nativeProps}
        ref={ref}
        role="separator"
        className={cx('yuki-dropdown-menu-separator', className)}
      />
    );
  }
  return (
    <Primitive.Separator {...props} ref={ref} className={cx('yuki-dropdown-menu-separator', className)} />
  );
});
