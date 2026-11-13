import {
  forwardRef,
  useEffect,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useNoticeDismiss } from '../../internal/useNoticeDismiss';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useLocale } from '../../theme';
import { Icon, type IconName } from '../icon';

export type NotificationTone = 'success' | 'error' | 'info' | 'warning' | 'loading';
export type NotificationPlacement =
  | 'topRight'
  | 'topLeft'
  | 'bottomRight'
  | 'bottomLeft'
  | 'top'
  | 'bottom';

export interface NotificationClassNames {
  root?: string;
  icon?: string;
  content?: string;
  title?: string;
  description?: string;
  action?: string;
  close?: string;
}

export interface NotificationStyles {
  root?: CSSProperties;
  icon?: CSSProperties;
  content?: CSSProperties;
  title?: CSSProperties;
  description?: CSSProperties;
  action?: CSSProperties;
  close?: CSSProperties;
}

export interface NotificationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  /** Headline. */
  title?: ReactNode;
  /** Supporting copy. Falls back to `children`. */
  description?: ReactNode;
  /** Supporting copy (alternative to `description`). */
  children?: ReactNode;
  /** Auto-dismiss a declarative notice after this many milliseconds. */
  duration?: number;
  onDismiss?: () => void;
  /** Semantic tone; drives the default icon and colour. @default 'info' */
  tone?: NotificationTone;
  /** Replace the built-in tone icon. */
  icon?: ReactNode;
  /** Show the leading icon. @default true */
  showIcon?: boolean;
  /** Render a dismiss button. @default true */
  closable?: boolean;
  /** Replace the dismiss glyph. */
  closeIcon?: ReactNode;
  /** Footer actions (buttons/links). */
  action?: ReactNode;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  /** Called when the dismiss button is pressed. */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const TONE_ICONS: Record<NotificationTone, IconName> = {
  success: 'check-circle',
  error: 'x-circle',
  info: 'info',
  warning: 'alert-triangle',
  loading: 'loader',
};

export const Notification = forwardRef<HTMLDivElement, NotificationProps>(
  function Notification(inputProps, ref) {
    const props = useComponentDefaults('Notification', inputProps);
    const {
      title,
      description,
      children,
      tone = 'info',
      icon,
      showIcon = true,
      closable = true,
      closeIcon,
      action,
      classNames,
      styles,
      className,
      style,
      onClose,
    duration, onDismiss,
      role,
      ...rest
    } = props;
    const { visible, dismiss } = useNoticeDismiss(duration, onDismiss);
    const { t } = useLocale();
    if (!visible) return null;
    const body = description ?? children;
    const iconNode =
      icon !== undefined ? icon : showIcon ? <Icon name={TONE_ICONS[tone]} spin={tone === 'loading'} /> : null;

    return (
      <div
        {...rest}
        ref={ref}
        role={role ?? (tone === 'error' ? 'alert' : 'status')}
        aria-atomic="true"
        className={cx('yuki-notification', `yuki-notification--${tone}`, classNames?.root, className)}
        style={{ ...style, ...styles?.root }}
        data-slot="root"
        data-tone={tone}
      >
        {iconNode != null && (
          <span
            className={cx('yuki-notification__icon', classNames?.icon)}
            style={styles?.icon}
            data-slot="icon"
            aria-hidden="true"
          >
            {iconNode}
          </span>
        )}
        <div
          className={cx('yuki-notification__content', classNames?.content)}
          style={styles?.content}
          data-slot="content"
        >
          {title != null && (
            <div
              className={cx('yuki-notification__title', classNames?.title)}
              style={styles?.title}
              data-slot="title"
            >
              {title}
            </div>
          )}
          {body != null && (
            <div
              className={cx('yuki-notification__description', classNames?.description)}
              style={styles?.description}
              data-slot="description"
            >
              {body}
            </div>
          )}
          {action != null && (
            <div
              className={cx('yuki-notification__action', classNames?.action)}
              style={styles?.action}
              data-slot="action"
            >
              {action}
            </div>
          )}
        </div>
        {closable && (
          <button
            type="button"
            className={cx('yuki-notification__close', classNames?.close)}
            style={styles?.close}
            data-slot="close"
            aria-label={t('common.close', { 'zh-CN': '关闭', 'en-US': 'Close' })}
            onClick={(event) => {
              onClose?.(event);
              if (!event.defaultPrevented && (onDismiss || duration !== undefined)) dismiss();
            }}
          >
            {closeIcon ?? <Icon name="x" size="sm" />}
          </button>
        )}
      </div>
    );
  },
);

Notification.displayName = 'Notification';

/** One entry rendered by the imperative notification stack. */
export interface NotificationStackItem {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: NotificationTone;
  /** Auto-dismiss delay in ms; `0` keeps the notification until closed. */
  duration: number;
  closable?: boolean;
  showIcon?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  placement?: NotificationPlacement;
  className?: string;
  style?: CSSProperties;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  onClose?: () => void;
}

const DEFAULT_PLACEMENT: NotificationPlacement = 'topRight';

function NotificationItem({
  item,
  requestClose,
}: {
  item: NotificationStackItem;
  requestClose: (id: string) => void;
}) {
  const { id, duration, onClose } = item;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = window.setTimeout(() => {
      onClose?.();
      requestClose(id);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [duration, id, onClose, requestClose]);

  return (
    <Notification
      title={item.title}
      description={item.description}
      tone={item.tone}
      icon={item.icon}
      showIcon={item.showIcon}
      closable={item.closable}
      action={item.action}
      className={item.className}
      style={item.style}
      classNames={item.classNames}
      styles={item.styles}
      onClose={() => {
        onClose?.();
        requestClose(id);
      }}
    />
  );
}

export interface NotificationStackProps {
  items: readonly NotificationStackItem[];
  requestClose: (id: string) => void;
}

/** Imperative stack renderer mounted by the notification API host. */
export function NotificationStack({ items, requestClose }: NotificationStackProps) {
  const { t } = useLocale();
  if (items.length === 0) return null;
  const groups = new Map<NotificationPlacement, NotificationStackItem[]>();
  for (const item of items) {
    const placement = item.placement ?? DEFAULT_PLACEMENT;
    const group = groups.get(placement);
    if (group) group.push(item);
    else groups.set(placement, [item]);
  }

  return (
    <>
      {Array.from(groups.entries()).map(([placement, groupItems]) => (
        <div
          key={placement}
          className="yuki-notification-list"
          data-yuki-imperative-list="notification"
          data-placement={placement}
          role="region"
          aria-label={t('notification.region', { 'zh-CN': '通知', 'en-US': 'Notifications' })}
        >
          {groupItems.map((item) => (
            <NotificationItem key={item.id} item={item} requestClose={requestClose} />
          ))}
        </div>
      ))}
    </>
  );
}
