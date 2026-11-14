import type { StyleProperties } from '../../styles/properties';
import {
  forwardRef,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useDialogConfirm } from '../../internal/useDialogConfirm';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useLocale } from '../../theme';
import { Button } from '../button';
import { Icon } from '../icon';
import { Popover, type PopoverProps } from '../popover';

export interface PopconfirmClassNames {
  root?: string;
  popup?: string;
  arrow?: string;
  body?: string;
  icon?: string;
  title?: string;
  description?: string;
  actions?: string;
  ok?: string;
  cancel?: string;
}

export interface PopconfirmStyles {
  root?: StyleProperties;
  popup?: StyleProperties;
  arrow?: StyleProperties;
  body?: StyleProperties;
  icon?: StyleProperties;
  title?: StyleProperties;
  description?: StyleProperties;
  actions?: StyleProperties;
  ok?: StyleProperties;
  cancel?: StyleProperties;
}

export interface PopconfirmProps extends Omit<PopoverProps, 'content' | 'title'> {
  /** Question or instruction shown first. */
  title?: ReactNode;
  prompt?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Optional supporting copy. */
  description?: ReactNode;
  /** Confirm button copy. Defaults to the locale `modal.ok` entry. */
  okText?: ReactNode;
  /** Cancel button copy. Defaults to the locale `modal.cancel` entry. */
  cancelText?: ReactNode;
  /** Confirm button tone; `danger` also recolours the icon. @default 'primary' */
  okTone?: 'primary' | 'danger';
  /** Replaces the built-in icon; pass `null` to hide it. */
  icon?: ReactNode | null;
  /** External loading flag for the confirm button. */
  confirmLoading?: boolean;
  /** Confirm handler; returning a promise keeps the button in a loading state until it settles. */
  onConfirm?: () => void | Promise<void>;
  /** Called when the cancel button dismisses the confirm. */
  onCancel?: () => void;
  classNames?: PopconfirmClassNames;
  styles?: PopconfirmStyles;
}

/**
 * A compact confirmation popover built on `Popover`. Owns its open state so
 * confirm/cancel can close the panel while remaining fully controllable.
 */
export const Popconfirm = forwardRef<HTMLSpanElement, PopconfirmProps>(function Popconfirm(
  inputProps,
  ref,
) {
  const {
    prompt, confirmLabel, cancelLabel,
    title = prompt,
    description,
    okText = confirmLabel,
    cancelText = cancelLabel,
    okTone = 'primary',
    icon,
    confirmLoading = false,
    onConfirm,
    onCancel,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placement = 'top',
    arrow = true,
    closeOnEscape = true,
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = useComponentDefaults('Popconfirm', inputProps);
  const { t } = useLocale();
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const close = () => setOpen(false);
  const { pending, submit: handleConfirm } = useDialogConfirm(open, onConfirm, close);
  const loading = confirmLoading || pending;

  const iconNode = icon !== undefined ? icon : <Icon name="help-circle" size="md" />;

  const handleCancel = () => {
    onCancel?.();
    close();
  };

  const content = (
    <div
      className={cx('yuki-popconfirm__body', classNames?.body)}
      style={styles?.body}
      data-slot="body"
      data-tone={okTone}
      onClick={(event) => event.stopPropagation()}
    >
      {iconNode != null && (
        <span
          className={cx('yuki-popconfirm__icon', classNames?.icon)}
          style={styles?.icon}
          data-slot="icon"
          aria-hidden="true"
        >
          {iconNode}
        </span>
      )}
      <div className="yuki-popconfirm__main">
        {title != null && (
          <div
            className={cx('yuki-popconfirm__title', classNames?.title)}
            style={styles?.title}
            data-slot="title"
          >
            {title}
          </div>
        )}
        {description != null && (
          <div
            className={cx('yuki-popconfirm__description', classNames?.description)}
            style={styles?.description}
            data-slot="description"
          >
            {description}
          </div>
        )}
        <div
          className={cx('yuki-popconfirm__actions', classNames?.actions)}
          style={styles?.actions}
          data-slot="actions"
        >
          <Button
            className={cx('yuki-popconfirm__cancel', classNames?.cancel)}
            style={styles?.cancel}
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={handleCancel}
          >
            {cancelText ?? t('modal.cancel', { 'zh-CN': '取消', 'en-US': 'Cancel' })}
          </Button>
          <Button
            className={cx('yuki-popconfirm__ok', classNames?.ok)}
            style={styles?.ok}
            size="sm"
            variant="solid"
            tone={okTone}
            loading={loading}
            onClick={handleConfirm}
          >
            {okText ?? t('modal.ok', { 'zh-CN': '确定', 'en-US': 'OK' })}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Popover
      {...rest}
      ref={ref}
      content={content}
      open={open}
      onOpenChange={setOpen}
      placement={placement}
      arrow={arrow}
      closeOnEscape={closeOnEscape}
      className={cx('yuki-popconfirm', classNames?.root, className)}
      style={style}
      classNames={{
        popup: cx('yuki-popconfirm__popup', classNames?.popup),
        arrow: classNames?.arrow,
      }}
      styles={{ popup: styles?.popup, arrow: styles?.arrow }}
    >
      {children}
    </Popover>
  );
});

Popconfirm.displayName = 'Popconfirm';
