import { useIsomorphicLayoutEffect } from '../../internal/useIsomorphicLayoutEffect';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type DOMAttributes,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import * as Primitive from '@radix-ui/react-dialog';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import { dismissScopedLayer } from '../../hooks/useEscapeKey';
import { DialogPopupScope } from '../../theme/ConfigProvider';
import { inertValue } from '../../internal/inert';
import { useComponentDefaults, useConfig, usePortalTheme, useTheme } from '../../theme';
import { useAnimation, usePresence, type AnimationOptions } from '../../animation';
import { useLocale } from '../../theme';

// Content.asChild forwards public DOM handlers to this surface. Retained portal children
// relay those handlers because their React event ancestry intentionally survives the surface.
const DialogSurface = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { events: MutableRefObject<Record<string, unknown>> }
>(function DialogSurface({ events, ...props }, ref) {
  events.current = Object.fromEntries(
    Object.entries(props).filter(
      ([key, value]) => key.startsWith('on') && typeof value === 'function',
    ),
  );
  return <div {...props} ref={ref} />;
});

export interface DialogProps extends ComponentPropsWithoutRef<typeof Primitive.Root> {
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  closeLabel?: string;
  portalContainer?: HTMLElement | null;
  portalProps?: Omit<ComponentPropsWithoutRef<typeof Primitive.Portal>, 'children'>;
  contentProps?: Omit<ComponentPropsWithoutRef<typeof Primitive.Content>, 'children' | 'asChild'>;
  overlayProps?: Omit<ComponentPropsWithoutRef<typeof Primitive.Overlay>, 'children' | 'asChild'>;
  titleProps?: ComponentPropsWithoutRef<typeof Primitive.Title>;
  descriptionProps?: ComponentPropsWithoutRef<typeof Primitive.Description>;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  footerProps?: HTMLAttributes<HTMLDivElement>;
  closeProps?: ComponentPropsWithoutRef<typeof Primitive.Close>;
  showClose?: boolean;
  closeIcon?: ReactNode;
  animation?: AnimationOptions | false;
}
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(input, ref) {
  const {
    trigger,
    title,
    description,
    footer,
    children,
    className,
    size = 'md',
    closeLabel,
    portalContainer,
    portalProps,
    contentProps,
    overlayProps,
    titleProps,
    descriptionProps,
    bodyProps,
    footerProps,
    closeProps,
    showClose = true,
    closeIcon = <Icon name="x" />,
    animation,
    open,
    defaultOpen = false,
    onOpenChange,
    modal = true,
    ...props
  } = useComponentDefaults('Dialog', input);
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isOpen = open ?? uncontrolled;
  const forced = !!(
    portalProps?.forceMount ||
    contentProps?.forceMount ||
    overlayProps?.forceMount
  );
  const portalTheme = usePortalTheme();
  const { getPopupContainer } = useConfig();
  const globalAnimation = useTheme().animation;
  const { duration, delay, ...motion } = useAnimation(animation, 'scale');
  const present = usePresence(isOpen, duration, delay);
  const {
    duration: _overlayDuration,
    delay: _overlayDelay,
    ...overlayMotion
  } = useAnimation(
    animation === false || (animation === undefined && globalAnimation === false)
      ? false
      : { ...animation, preset: 'fade' },
    'fade',
  );
  const { messages } = useLocale();
  const descriptionId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(isOpen);
  const focusActive = useRef(false);
  const interactedOutside = useRef(false);
  const [retainedHost, setRetainedHost] = useState<HTMLDivElement | null>(null);
  const surfaceEvents = useRef<Record<string, unknown>>({});
  useIsomorphicLayoutEffect(() => {
    if (retainedHost) return;
    const host = document.createElement('div');
    host.style.display = 'contents';
    setRetainedHost(host);
  }, [retainedHost]);
  openRef.current = isOpen;
  const contentRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (node && retainedHost) node.appendChild(retainedHost);
      if (typeof ref === 'function') {
        const cleanup: unknown = ref(node);
        if (typeof cleanup === 'function')
          return () => {
            contentRef.current = null;
            cleanup();
          };
        return;
      }
      if (ref) ref.current = node;
    },
    [ref, retainedHost],
  );
  const closeFocus = (event: Event) => {
    if (openRef.current || !focusActive.current) {
      event.preventDefault();
      return;
    }
    focusActive.current = false;
    contentProps?.onCloseAutoFocus?.(event);
    if (event.defaultPrevented) return;
    const target = triggerRef.current ?? returnFocus.current;
    if ((!trigger || forced) && (modal || !interactedOutside.current) && target?.isConnected) {
      event.preventDefault();
      target.focus();
    }
  };
  useEffect(
    () => () => {
      openRef.current = false;
    },
    [],
  );
  const { forceMount: _overlayForceMount, ...closedOverlayProps } = overlayProps ?? {};
  const {
    forceMount: _contentForceMount,
    onOpenAutoFocus: _onOpenAutoFocus,
    onCloseAutoFocus: _onCloseAutoFocus,
    onEscapeKeyDown: _onEscapeKeyDown,
    onPointerDownOutside: _onPointerDownOutside,
    onFocusOutside: _onFocusOutside,
    onInteractOutside: _onInteractOutside,
    ...closedContentProps
  } = contentProps ?? {};
  const relayedEvents = Object.fromEntries(
    [
      ...new Set([
        'onPointerDownCapture',
        'onFocusCapture',
        'onBlurCapture',
        'onKeyDown',
        ...Object.keys(closedContentProps).filter((key) => key.startsWith('on')),
      ]),
    ].map((key) => [
      key,
      (event: unknown) => {
        const handler = surfaceEvents.current[key];
        if (typeof handler === 'function') handler(event);
      },
    ]),
  ) as DOMAttributes<HTMLDivElement>;
  const template = (
    <div style={{ display: 'contents' }} {...relayedEvents}>
      <Primitive.Title {...titleProps} className={cx('yuki-dialog__title', titleProps?.className)}>
        {title}
      </Primitive.Title>
      {description && (
        <Primitive.Description
          {...descriptionProps}
          id={descriptionProps?.id ?? descriptionId}
          className={cx('yuki-dialog__description', descriptionProps?.className)}
        >
          {description}
        </Primitive.Description>
      )}
      <div {...bodyProps} className={cx('yuki-dialog__body', bodyProps?.className)}>
        {children}
      </div>
      {footer && (
        <div {...footerProps} className={cx('yuki-dialog__footer', footerProps?.className)}>
          {footer}
        </div>
      )}
      {showClose && (
        <Primitive.Close
          {...closeProps}
          className={cx('yuki-dialog__close', closeProps?.className)}
          aria-label={closeLabel ?? closeProps?.['aria-label'] ?? messages.dialogClose}
        >
          {closeIcon}
        </Primitive.Close>
      )}
    </div>
  );
  const overlay = (
    <Primitive.Overlay
      {...overlayProps}
      {...portalTheme}
      {...overlayMotion}
      className={cx(
        portalTheme.className,
        'yuki-dialog-overlay',
        overlayMotion.className,
        overlayProps?.className,
      )}
      style={{ ...portalTheme.style, ...overlayMotion.style, ...overlayProps?.style }}
      aria-hidden="true"
    />
  );
  return (
    <Primitive.Root
      {...props}
      open={isOpen}
      onOpenChange={(next) => {
        if (open === undefined) setUncontrolled(next);
        onOpenChange?.(next);
      }}
      modal={modal}
    >
      {trigger && (
        <Primitive.Trigger asChild ref={triggerRef}>
          {trigger}
        </Primitive.Trigger>
      )}
      {(present || forced) && (
        <Primitive.Portal
          {...portalProps}
          container={portalContainer ?? portalProps?.container ?? getPopupContainer(triggerRef.current)}
          forceMount
        >
          {!isOpen
            ? modal && (
                <div
                  {...closedOverlayProps}
                  {...portalTheme}
                  {...overlayMotion}
                  className={cx(
                    portalTheme.className,
                    'yuki-dialog-overlay',
                    overlayMotion.className,
                    overlayProps?.className,
                  )}
                  style={{ ...portalTheme.style, ...overlayMotion.style, ...overlayProps?.style }}
                  data-state="closed"
                  hidden={forced || undefined}
                  aria-hidden="true"
                  inert={inertValue(true)}
                />
              )
            : overlay}
          {!isOpen || !retainedHost ? (
            <DialogSurface
              events={surfaceEvents}
              {...closedContentProps}
              {...portalTheme}
              {...motion}
              ref={contentRefCallback}
              role="dialog"
              className={cx(
                portalTheme.className,
                'yuki-dialog',
                `yuki-dialog--${size}`,
                motion.className,
                className,
                contentProps?.className,
              )}
              style={{ ...portalTheme.style, ...motion.style, ...contentProps?.style }}
              data-state="closed"
              hidden={forced || !retainedHost || undefined}
              inert={inertValue(true)}
              aria-hidden="true"
            />
          ) : (
            <Primitive.Content
              {...contentProps}
              {...portalTheme}
              {...motion}
              asChild
              ref={contentRefCallback}
              className={cx(
                portalTheme.className,
                'yuki-dialog',
                `yuki-dialog--${size}`,
                motion.className,
                className,
                contentProps?.className,
              )}
              style={{ ...portalTheme.style, ...motion.style, ...contentProps?.style }}
              hidden={contentProps?.hidden || (forced && !isOpen) || undefined}
              inert={inertValue(!isOpen || undefined)}
              aria-hidden={!isOpen || contentProps?.['aria-hidden']}
              aria-describedby={
                contentProps?.['aria-describedby'] ??
                (description ? (descriptionProps?.id ?? descriptionId) : undefined)
              }
              onEscapeKeyDown={(event) => {
                dismissScopedLayer(event, retainedHost);
                if (!event.defaultPrevented) contentProps?.onEscapeKeyDown?.(event);
              }}
              onOpenAutoFocus={(event) => {
                if (!isOpen) {
                  event.preventDefault();
                  return;
                }
                returnFocus.current =
                  document.activeElement instanceof HTMLElement ? document.activeElement : null;
                focusActive.current = true;
                interactedOutside.current = false;
                contentProps?.onOpenAutoFocus?.(event);
              }}
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
              <DialogSurface events={surfaceEvents} />
            </Primitive.Content>
          )}
        </Primitive.Portal>
      )}
      {(present || forced) && retainedHost && createPortal(<DialogPopupScope host={retainedHost}>{template}</DialogPopupScope>, retainedHost)}
    </Primitive.Root>
  );
});
export const DialogClose = Primitive.Close;
