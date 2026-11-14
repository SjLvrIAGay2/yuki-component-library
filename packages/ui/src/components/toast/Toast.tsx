import type { WithStyle } from '../../styles/properties';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import * as Primitive from '@radix-ui/react-toast';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import { inertValue } from '../../internal/inert';
import { mergeProps } from '../../internal/merge-props';
import { useComponentDefaults, useConfig, usePortalTheme } from '../../theme';
import { useAnimation, usePresence, type AnimationOptions } from '../../animation';
import { useLocale } from '../../theme';

export type ToastRootProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.Root>,
  'children' | 'asChild' | 'open' | 'defaultOpen' | 'duration' | 'forceMount'
>;
export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  variant?: 'info' | 'success' | 'danger' | 'warning';
  duration?: number;
  icon?: ReactNode;
  action?: ReactNode;
  animation?: AnimationOptions | false;
  rootProps?: ToastRootProps;
  titleProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Title>>;
  descriptionProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Description>>;
  closeProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Close>>;
  hideClose?: boolean;
}
export interface ToastDismissOptions {
  animate?: boolean;
}
export interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  /** Immediate by default for compatibility. animate keeps an inert exiting surface. */
  dismiss: (id: string, options?: ToastDismissOptions) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);
export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
  label?: string;
  closeLabel?: string;
  position?: ToastPosition;
  maxToasts?: number;
  portalContainer?: HTMLElement | null;
  providerProps?: Omit<WithStyle<ComponentPropsWithoutRef<typeof Primitive.Provider>>, 'children'>;
  viewportProps?: WithStyle<ComponentPropsWithoutRef<typeof Primitive.Viewport>>;
  toastProps?: Omit<ToastOptions, 'title' | 'description' | 'duration'>;
  animation?: AnimationOptions | false;
}
interface ToastItemState extends ToastOptions {
  id: string;
  open: boolean;
}

function ToastItem({
  item,
  animation,
  closeLabel,
  close,
  remove,
  viewport,
  swipeDirection,
}: {
  item: ToastItemState;
  animation?: AnimationOptions | false;
  closeLabel: string;
  close: (id: string) => void;
  remove: (id: string) => void;
  viewport: HTMLOListElement | null;
  swipeDirection: 'up' | 'down' | 'left' | 'right';
}) {
  const { duration, delay, ...motion } = useAnimation(
    item.animation === undefined ? animation : item.animation,
    'slide',
  );
  const present = usePresence(item.open, duration, delay);
  const root = item.rootProps;
  const [swiped, setSwiped] = useState(false);
  useEffect(() => {
    if (!present) remove(item.id);
  }, [present, item.id, remove]);
  if (!present) return null;
  const className = cx(
    'yuki-toast',
    `yuki-toast--${item.variant ?? 'info'}`,
    motion.className,
    root?.className,
  );
  const style = { ...motion.style, ...root?.style };
  const content = (interactive: boolean) => (
    <>
      <span className="yuki-toast__icon" aria-hidden="true">
        {item.icon === undefined ? (
          <Icon
            name={
              item.variant === 'success'
                ? 'check'
                : item.variant === 'danger' || item.variant === 'warning'
                  ? 'alert-triangle'
                  : 'info'
            }
          />
        ) : (
          item.icon
        )}
      </span>
      <div className="yuki-toast__body">
        <Primitive.Title
          {...item.titleProps}
          className={cx('yuki-toast__title', item.titleProps?.className)}
        >
          {item.title}
        </Primitive.Title>
        {item.description && (
          <Primitive.Description
            {...item.descriptionProps}
            className={cx('yuki-toast__description', item.descriptionProps?.className)}
          >
            {item.description}
          </Primitive.Description>
        )}
        {item.action}
      </div>
      {!item.hideClose &&
        (interactive ? (
          <Primitive.Close
            {...item.closeProps}
            className={cx('yuki-toast__close', item.closeProps?.className)}
            aria-label={item.closeProps?.['aria-label'] ?? closeLabel}
          >
            {item.closeProps?.children === undefined ? (
              <Icon name="x" />
            ) : (
              item.closeProps.children
            )}
          </Primitive.Close>
        ) : (
          <span
            className={cx('yuki-toast__close', item.closeProps?.className)}
            style={item.closeProps?.style}
            aria-hidden="true"
          >
            {item.closeProps?.children === undefined ? (
              <Icon name="x" />
            ) : (
              item.closeProps.children
            )}
          </span>
        ))}
    </>
  );
  if (!item.open) {
    // A visual exit must stop participating in Radix's keyboard layer immediately.
    const {
      onOpenChange,
      onEscapeKeyDown,
      onPause,
      onResume,
      onSwipeStart,
      onSwipeMove,
      onSwipeCancel,
      onSwipeEnd,
      type,
      ...surface
    } = root ?? {};
    return viewport
      ? createPortal(
          <li
            {...surface}
            {...motion}
            className={className}
            style={style}
            data-state="closed"
            data-swipe={swiped ? 'end' : undefined}
            data-swipe-direction={swipeDirection}
            aria-hidden="true"
            inert={inertValue(true)}
            tabIndex={-1}
          >
            {content(false)}
          </li>,
          viewport,
        )
      : null;
  }
  return (
    <Primitive.Root
      {...root}
      {...motion}
      open
      inert={inertValue(root?.inert)}
      duration={item.duration}
      className={className}
      style={style}
      onSwipeEnd={(event) => {
        root?.onSwipeEnd?.(event);
        if (!event.defaultPrevented) setSwiped(true);
      }}
      onOpenChange={(open) => {
        root?.onOpenChange?.(open);
        if (!open) close(item.id);
      }}
    >
      {content(true)}
    </Primitive.Root>
  );
}

export function ToastProvider(input: ToastProviderProps) {
  const {
    children,
    duration,
    label: requestedLabel,
    closeLabel,
    position = 'bottom-right',
    maxToasts = 5,
    portalContainer,
    providerProps,
    viewportProps,
    toastProps,
    animation,
  } = useComponentDefaults('ToastProvider', input);
  const [items, setItems] = useState<ToastItemState[]>([]);
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState<HTMLOListElement | null>(null);
  const sequence = useRef(0);
  const prefix = useId();
  const portalTheme = usePortalTheme();
  const { getPopupContainer } = useConfig();
  const { messages } = useLocale();
  const label = requestedLabel ?? providerProps?.label ?? messages.toastLabel;
  const limit = Number.isFinite(maxToasts) ? Math.min(100, Math.max(1, Math.floor(maxToasts))) : 5;
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    setItems((previous) => (previous.length > limit ? previous.slice(-limit) : previous));
  }, [limit]);
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `${prefix}-${++sequence.current}`;
      setItems((previous) =>
        [...previous, { ...mergeProps(toastProps, options), id, open: true }].slice(-limit),
      );
      return id;
    },
    [prefix, limit, toastProps],
  );
  const remove = useCallback(
    (id: string) => setItems((previous) => previous.filter((item) => item.id !== id)),
    [],
  );
  const close = useCallback(
    (id: string) =>
      setItems((previous) =>
        previous.map((item) => (item.id === id ? { ...item, open: false } : item)),
      ),
    [],
  );
  const dismiss = useCallback(
    (id: string, options?: ToastDismissOptions) => {
      if (options?.animate) close(id);
      else remove(id);
    },
    [close, remove],
  );
  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <Primitive.Provider
        {...providerProps}
        duration={duration ?? providerProps?.duration ?? 5000}
        swipeDirection={providerProps?.swipeDirection ?? 'right'}
        label={label}
      >
        {children}
        {mounted &&
          createPortal(
            <>
              <Primitive.Viewport
                ref={setViewport}
                {...viewportProps}
                {...portalTheme}
                className={cx(
                  portalTheme.className,
                  'yuki-toast-viewport',
                  `yuki-toast-viewport--${position}`,
                  viewportProps?.className,
                )}
                style={{ ...portalTheme.style, ...viewportProps?.style }}
                label={viewportProps?.label ?? `${label} ({hotkey})`}
              />
              {items.map((item) => (
                <ToastItem
                  key={item.id}
                  item={item}
                  animation={animation}
                  closeLabel={closeLabel ?? messages.toastClose}
                  close={close}
                  remove={remove}
                  viewport={viewport}
                  swipeDirection={providerProps?.swipeDirection ?? 'right'}
                />
              ))}
            </>,
            portalContainer ?? getPopupContainer(),
          )}
      </Primitive.Provider>
    </ToastContext.Provider>
  );
}
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
