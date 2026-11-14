import type { StyleProperties, WithStyle } from '../../styles/properties';
import { Slot } from '@radix-ui/react-slot';
import { inertValue } from '../../internal/inert';
import { useDialogConfirm } from '../../internal/useDialogConfirm';
import { DialogPopupScope } from '../../theme/ConfigProvider';
import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useCallback,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx } from '../../internal/cx';
import { Portal } from '../../internal/Portal';
import {
  useControllableState,
  useEscapeKey,
  useFocusTrap,
  useMergedRefs,
  useScrollLock,
} from '../../hooks';
import { useLocale } from '../../theme';
import { Button, type ButtonTone } from '../button';
import { Icon } from '../icon';

export type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerClassNames {
  root?: string;
  mask?: string;
  panel?: string;
  header?: string;
  title?: string;
  close?: string;
  body?: string;
  footer?: string;
  ok?: string;
  cancel?: string;
}

export interface DrawerStyles {
  root?: StyleProperties;
  mask?: StyleProperties;
  panel?: StyleProperties;
  header?: StyleProperties;
  title?: StyleProperties;
  close?: StyleProperties;
  body?: StyleProperties;
  footer?: StyleProperties;
  ok?: StyleProperties;
  cancel?: StyleProperties;
}

export interface DrawerProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Panel headline; also used as its accessible name. */
  title?: ReactNode;
  /** Supporting copy announced below the title. */
  description?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Custom footer; pass `null` to hide it. */
  footer?: ReactNode | null;
  okText?: ReactNode;
  cancelText?: ReactNode;
  /** Confirm button tone. @default 'primary' */
  okTone?: ButtonTone;
  /** External loading flag for the confirm button. */
  okLoading?: boolean;
  /** Confirm handler; returning a promise closes on resolution. */
  onOk?: () => void | Promise<void>;
  /** Cancel/dismiss handler. */
  onCancel?: () => void;
  /** Show the header dismiss button. @default true */
  closable?: boolean;
  /** Close when the backdrop is pressed. @default true */
  maskClosable?: boolean;
  /** Close on Escape. @default true */
  closeOnEscape?: boolean;
  /** Render the backdrop. @default true */
  showMask?: boolean;
  /** Edge the panel slides in from. @default 'right' */
  placement?: DrawerPlacement;
  side?: DrawerPlacement;
  /** Panel thickness preset. @default 'md' */
  size?: DrawerSize;
  /** Portal target; defaults to the ConfigProvider popup host. */
  container?: HTMLElement | null;
  portalContainer?: HTMLElement | null;
  portalProps?: { container?: HTMLElement | null; forceMount?: boolean };
  /** An element that opens the drawer. Its own event handler runs first. */
  trigger?: ReactElement;
  /** Keep the hidden panel and its contents mounted between openings. */
  forceMount?: boolean;
  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
}

const PANEL_SIZE: Record<DrawerSize, string> = {
  sm: 'var(--yuki-popup-width-sm)',
  md: 'var(--yuki-popup-width-md)',
  lg: 'var(--yuki-popup-width-lg)',
};

/**
 * Edge-anchored dialog with the same focus, scroll-lock and dismissal contract
 * as `Modal`.
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  inputProps,
  ref,
) {
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    title,
    description,
    children,
    footer,
    okText,
    cancelText,
    okTone = 'primary',
    okLoading = false,
    onOk,
    onCancel,
    closable = true,
    maskClosable = true,
    closeOnEscape = true,
    showMask = true,
    side, placement = side ?? 'right',
    size = 'md',
    container,
    portalContainer,
    portalProps,
    trigger,
    forceMount = portalProps?.forceMount ?? false,
    classNames,
    styles,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    ...rest
  } = useComponentDefaults('Drawer', inputProps);
  const { t } = useLocale();
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null);
  const mergedPanelRef = useMergedRefs<HTMLDivElement>(ref, setPanelNode);
  const trapRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({ current: panelNode }),
    [panelNode],
  );
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);
  useFocusTrap(trapRef, { active: open, restoreFocus: true });

  const requestClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleCancel = () => {
    onCancel?.();
    requestClose();
  };

  useEscapeKey(handleCancel, open && closeOnEscape);

  const { pending, submit: handleOk } = useDialogConfirm(open, onOk, requestClose);
  const loading = okLoading || pending;

  const panelId = useId();
  const triggerNode = trigger ? (
    <Slot aria-haspopup="dialog" aria-expanded={open} aria-controls={panelId}
      onClick={event => { if (!event.defaultPrevented) setOpen(true); }}>
      {trigger}
    </Slot>
  ) : null;
  if (!open && !forceMount) return triggerNode;

  const footerNode =
    footer === null ? null : (
      <div
        className={cx('yuki-drawer__footer', classNames?.footer)}
        style={styles?.footer}
        data-slot="footer"
      >
        {footer ?? (
          <>
            <Button
              className={cx('yuki-drawer__cancel', classNames?.cancel)}
              style={styles?.cancel}
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText ?? t('modal.cancel', { 'zh-CN': '取消', 'en-US': 'Cancel' })}
            </Button>
            <Button
              className={cx('yuki-drawer__ok', classNames?.ok)}
              style={styles?.ok}
              variant="solid"
              tone={okTone}
              loading={loading}
              onClick={handleOk}
            >
              {okText ?? t('modal.ok', { 'zh-CN': '确定', 'en-US': 'OK' })}
            </Button>
          </>
        )}
      </div>
    );

  return (
    <>
      {triggerNode}
      <Portal container={container ?? portalContainer ?? portalProps?.container}>
        <div
          {...rest}
          hidden={!open || rest.hidden}
          inert={inertValue(!open || rest.inert)}
          className={cx('yuki-drawer', classNames?.root, className)}
          style={{ ...style, ...styles?.root }}
          data-slot="root"
          data-placement={placement}
          data-size={size}
        >
          {showMask && (
            <div
              className={cx('yuki-drawer__mask', classNames?.mask)}
              style={styles?.mask}
              data-slot="mask"
              aria-hidden="true"
              onClick={() => {
                if (maskClosable) handleCancel();
              }}
            />
          )}
          <div
            id={panelId}
            ref={mergedPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={labelledBy ?? (ariaLabel == null && title != null ? titleId : undefined)}
            aria-describedby={describedBy ?? (description != null ? descriptionId : undefined)}
            tabIndex={-1}
            className={cx('yuki-drawer__panel', classNames?.panel)}
            style={{ ...styles?.panel, ['--yuki-drawer-size' as string]: PANEL_SIZE[size] }}
            data-slot="panel"
          >
            <DialogPopupScope host={panelNode}>
              {(title != null || closable) && (
                <div
                  className={cx('yuki-drawer__header', classNames?.header)}
                  style={styles?.header}
                  data-slot="header"
                >
                  {title != null && (
                    <h2
                      id={titleId}
                      className={cx('yuki-drawer__title', classNames?.title)}
                      style={styles?.title}
                      data-slot="title"
                    >
                      {title}
                    </h2>
                  )}
                  {closable && (
                    <button
                      type="button"
                      className={cx('yuki-drawer__close', classNames?.close)}
                      style={styles?.close}
                      data-slot="close"
                      aria-label={t('common.close', { 'zh-CN': '关闭', 'en-US': 'Close' })}
                      onClick={handleCancel}
                    >
                      <Icon name="x" size="md" />
                    </button>
                  )}
                </div>
              )}
              <div
                className={cx('yuki-drawer__body', classNames?.body)}
                style={styles?.body}
                data-slot="body"
              >
                {description != null && (
                  <p id={descriptionId} className="yuki-drawer__description" data-slot="description">
                    {description}
                  </p>
                )}
                {children}
              </div>
              {footerNode}
            </DialogPopupScope>
          </div>
        </div>
      </Portal>
    </>
  );
});

Drawer.displayName = 'Drawer';
