import type { StyleProperties, WithStyle } from '../../styles/properties';
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

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalClassNames {
  root?: string;
  mask?: string;
  dialog?: string;
  header?: string;
  title?: string;
  close?: string;
  body?: string;
  footer?: string;
  ok?: string;
  cancel?: string;
}

export interface ModalStyles {
  root?: StyleProperties;
  mask?: StyleProperties;
  dialog?: StyleProperties;
  header?: StyleProperties;
  title?: StyleProperties;
  close?: StyleProperties;
  body?: StyleProperties;
  footer?: StyleProperties;
  ok?: StyleProperties;
  cancel?: StyleProperties;
}

export interface ModalProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Dialog headline; also used as its accessible name. */
  title?: ReactNode;
  /** Supporting copy announced below the title. */
  description?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Custom footer; pass `null` to hide it. */
  footer?: ReactNode | null;
  /** Confirm button copy. Defaults to the locale `modal.ok` entry. */
  okText?: ReactNode;
  /** Cancel button copy. Defaults to the locale `modal.cancel` entry. */
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
  /** Vertically centre the dialog. @default true */
  centered?: boolean;
  /** Width preset. @default 'md' */
  size?: ModalSize;
  /** Portal target; defaults to the ConfigProvider popup host. */
  container?: HTMLElement | null;
  classNames?: ModalClassNames;
  styles?: ModalStyles;
}

const DEFAULT_WIDTH: Record<ModalSize, string> = {
  sm: 'var(--yuki-popup-width-sm)',
  md: 'var(--yuki-popup-width-md)',
  lg: 'var(--yuki-popup-width-lg)',
  xl: 'calc(var(--yuki-popup-width-lg) * 1.5)',
};

/**
 * Modal dialog: focus trap, scroll lock, Escape/backdrop dismissal, focus
 * restoration and an accessible labelled container.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
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
    centered = true,
    size = 'md',
    container,
    classNames,
    styles,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    ...rest
  } = useComponentDefaults('Modal', inputProps);
  const { t } = useLocale();
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [dialogNode, setDialogNode] = useState<HTMLDivElement | null>(null);
  const mergedDialogRef = useMergedRefs<HTMLDivElement>(ref, setDialogNode);
  // Portal mounts one commit after `open`, so track the dialog node in state and
  // hand the trap a fresh ref once the node exists.
  const trapRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({ current: dialogNode }),
    [dialogNode],
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

  const handleMaskClick = () => {
    if (maskClosable) handleCancel();
  };

  if (!open) return null;

  const footerNode =
    footer === null ? null : (
      <div
        className={cx('yuki-modal__footer', classNames?.footer)}
        style={styles?.footer}
        data-slot="footer"
      >
        {footer ?? (
          <>
            <Button
              className={cx('yuki-modal__cancel', classNames?.cancel)}
              style={styles?.cancel}
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText ?? t('modal.cancel', { 'zh-CN': '取消', 'en-US': 'Cancel' })}
            </Button>
            <Button
              className={cx('yuki-modal__ok', classNames?.ok)}
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
    <Portal container={container}>
      <div
        {...rest}
        className={cx('yuki-modal', classNames?.root, className)}
        style={{ ...style, ...styles?.root }}
        data-slot="root"
        data-size={size}
        data-centered={centered ? 'true' : 'false'}
      >
        {showMask && (
          <div
            className={cx('yuki-modal__mask', classNames?.mask)}
            style={styles?.mask}
            data-slot="mask"
            aria-hidden="true"
            onClick={() => {
              handleMaskClick();
            }}
          />
        )}
        <div
          ref={mergedDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={labelledBy ?? (ariaLabel == null && title != null ? titleId : undefined)}
          aria-describedby={describedBy ?? (description != null ? descriptionId : undefined)}
          tabIndex={-1}
          className={cx('yuki-modal__dialog', classNames?.dialog)}
          style={{
            ...styles?.dialog,
            ['--yuki-modal-width' as string]: DEFAULT_WIDTH[size],
          }}
          data-slot="dialog"
        >
          <DialogPopupScope host={dialogNode}>
            {(title != null || closable) && (
              <div
                className={cx('yuki-modal__header', classNames?.header)}
                style={styles?.header}
                data-slot="header"
              >
                {title != null && (
                  <h2
                    id={titleId}
                    className={cx('yuki-modal__title', classNames?.title)}
                    style={styles?.title}
                    data-slot="title"
                  >
                    {title}
                  </h2>
                )}
                {closable && (
                  <button
                    type="button"
                    className={cx('yuki-modal__close', classNames?.close)}
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
              className={cx('yuki-modal__body', classNames?.body)}
              style={styles?.body}
              data-slot="body"
            >
              {description != null && (
                <p
                  id={descriptionId}
                  className="yuki-modal__description"
                  data-slot="description"
                >
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
  );
});

Modal.displayName = 'Modal';
