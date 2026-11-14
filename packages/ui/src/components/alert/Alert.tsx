import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon, type IconName } from '../icon';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AlertVariant = 'subtle' | 'outline' | 'solid';

export interface AlertClassNames {
  root?: string;
  icon?: string;
  content?: string;
  title?: string;
  description?: string;
  action?: string;
  close?: string;
}

export interface AlertStyles {
  root?: StyleProperties;
  icon?: StyleProperties;
  content?: StyleProperties;
  title?: StyleProperties;
  description?: StyleProperties;
  action?: StyleProperties;
  close?: StyleProperties;
}

export interface AlertProps
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'children'> {
  /** Title rendered above the description. */
  title?: ReactNode;
  /** Supporting copy. Falls back to `children` when omitted. */
  description?: ReactNode;
  /** Supporting copy (alternative to `description`). */
  children?: ReactNode;
  /** Semantic status tone. @default 'info' */
  tone?: AlertTone;
  /** Visual treatment. @default 'subtle' */
  variant?: AlertVariant | AlertTone;
  closeLabel?: string;
  bodyProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  titleProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  descriptionProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
  closeProps?: WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Show a leading status icon. @default true */
  showIcon?: boolean;
  /** Replace the built-in status icon; pass `null` to show nothing. */
  icon?: ReactNode;
  /** Render a dismiss button. */
  closable?: boolean;
  /** Replace the dismiss glyph. */
  closeIcon?: ReactNode;
  /** Trailing action node (buttons/links). */
  action?: ReactNode;
  /** Full-bleed banner layout without radius. */
  banner?: boolean;
  /** Component size. */
  size?: Size;
  /** Per-slot class names. */
  classNames?: AlertClassNames;
  /** Per-slot inline styles. */
  styles?: AlertStyles;
  /** Called when the dismiss button is pressed. */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const TONE_ICONS: Record<AlertTone, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(inputProps, ref) {
  const props = useComponentDefaults('Alert', inputProps);
  const {
    title,
    description,
    children,
    tone: toneProp,
    variant: variantProp = 'subtle', closeLabel, closeProps, bodyProps, titleProps, descriptionProps,
    showIcon = true,
    icon,
    closable: closableProp,
    closeIcon,
    action,
    banner = false,
    size: sizeProp,
    role,
    classNames,
    styles,
    className,
    style,
    onClose,
    ...rest
  } = props;
  const closable = closableProp ?? Boolean(closeProps || closeLabel || onClose);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const variant = variantProp === 'solid' || variantProp === 'outline' ? variantProp : 'subtle';
  const tone = toneProp ?? (variantProp === 'info' || variantProp === 'success' ||
    variantProp === 'warning' || variantProp === 'danger' ? variantProp : 'info');
  const body = description ?? children;
  const iconNode = icon !== undefined ? icon : showIcon ? <Icon name={TONE_ICONS[tone]} /> : null;

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        'yuki-alert',
        `yuki-alert--${tone}`,
        `yuki-alert--${variant}`,
        banner && 'yuki-alert--banner',
        classNames?.root,
        className,
      )}
      style={{ ...style, ...styles?.root }}
      data-slot="root"
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      role={role ?? (tone === 'danger' || tone === 'warning' ? 'alert' : 'status')}
    >
      {iconNode != null && (
        <span
          className={cx('yuki-alert__icon', classNames?.icon)}
          style={styles?.icon}
          data-slot="icon"
          aria-hidden="true"
        >
          {iconNode}
        </span>
      )}
      <div {...bodyProps} className={cx('yuki-alert__content', classNames?.content, bodyProps?.className)} style={{ ...styles?.content, ...bodyProps?.style }} data-slot="content">
        {title != null && (
          <div {...titleProps} className={cx('yuki-alert__title', classNames?.title, titleProps?.className)} style={{ ...styles?.title, ...titleProps?.style }} data-slot="title">
            {title}
          </div>
        )}
        {body != null && (
          <div
            {...descriptionProps} className={cx('yuki-alert__description', classNames?.description, descriptionProps?.className)}
            style={{ ...styles?.description, ...descriptionProps?.style }}
            data-slot="description"
          >
            {body}
          </div>
        )}
      </div>
      {action != null && (
        <div className={cx('yuki-alert__action', classNames?.action)} style={styles?.action} data-slot="action">
          {action}
        </div>
      )}
      {closable && (
        <button
          type="button"
          {...closeProps} className={cx('yuki-alert__close', classNames?.close, closeProps?.className)}
          style={{ ...styles?.close, ...closeProps?.style }}
          data-slot="close"
          aria-label={closeLabel ?? closeProps?.['aria-label'] ?? t('common.close', { 'zh-CN': '关闭', 'en-US': 'Close' })}
          onClick={(event) => {
            closeProps?.onClick?.(event);
            if (!event.defaultPrevented) onClose?.(event);
          }}
        >
          {closeProps?.children ?? closeIcon ?? <Icon name="x" size="sm" />}
        </button>
      )}
    </div>
  );
});

Alert.displayName = 'Alert';
