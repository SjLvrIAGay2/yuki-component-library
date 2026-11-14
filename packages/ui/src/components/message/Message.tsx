import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useNoticeDismiss } from '../../internal/useNoticeDismiss';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useLocale } from '../../theme';
import { Icon, type IconName } from '../icon';

export type MessageTone = 'success' | 'error' | 'info' | 'warning' | 'loading';
export type MessagePlacement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

export interface MessageClassNames {
  root?: string;
  icon?: string;
  content?: string;
  action?: string;
  close?: string;
}

export interface MessageStyles {
  root?: StyleProperties;
  icon?: StyleProperties;
  content?: StyleProperties;
  action?: StyleProperties;
  close?: StyleProperties;
}

export interface MessageProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title' | 'content'> {
  /** Auto-dismiss a declarative notice after this many milliseconds. */
  title?: ReactNode;
  duration?: number;
  onDismiss?: () => void;
  /** Semantic tone; drives the default icon and colour. @default 'info' */
  tone?: MessageTone;
  /** Replace the built-in tone icon. */
  icon?: ReactNode;
  /** Show the leading icon. @default true */
  showIcon?: boolean;
  /** Render a dismiss button. */
  closable?: boolean;
  /** Replace the dismiss glyph. */
  closeIcon?: ReactNode;
  /** Inline action node rendered after the content. */
  action?: ReactNode;
  classNames?: MessageClassNames;
  styles?: MessageStyles;
  /** Called when the dismiss button is pressed. */
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const TONE_ICONS: Record<MessageTone, IconName> = {
  success: 'check-circle',
  error: 'x-circle',
  info: 'info',
  warning: 'alert-triangle',
  loading: 'loader',
};

export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message(inputProps, ref) {
  const props = useComponentDefaults('Message', inputProps);
  const {
    tone = 'info',
    icon,
    showIcon = true,
    closable: closableProp,
    closeIcon,
    action,
    title,
    children,
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
  const closable = closableProp ?? !!onDismiss;
  const { t } = useLocale();
  if (!visible) return null;
  const iconNode =
    icon !== undefined ? icon : showIcon ? <Icon name={TONE_ICONS[tone]} spin={tone === 'loading'} /> : null;

  return (
    <div
      {...rest}
      ref={ref}
      role={role ?? (tone === 'error' ? 'alert' : 'status')}
      aria-atomic="true"
      className={cx('yuki-message', `yuki-message--${tone}`, classNames?.root, className)}
      style={{ ...style, ...styles?.root }}
      data-slot="root"
      data-tone={tone}
    >
      {iconNode != null && (
        <span
          className={cx('yuki-message__icon', classNames?.icon)}
          style={styles?.icon}
          data-slot="icon"
          aria-hidden="true"
        >
          {iconNode}
        </span>
      )}
      <span
        className={cx('yuki-message__content', classNames?.content)}
        style={styles?.content}
        data-slot="content"
      >
        {title != null && <strong>{title}</strong>}{title != null && children != null && ' '}{children}
      </span>
      {action != null && (
        <span className={cx('yuki-message__action', classNames?.action)} style={styles?.action} data-slot="action">
          {action}
        </span>
      )}
      {closable && (
        <button
          type="button"
          className={cx('yuki-message__close', classNames?.close)}
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
});

Message.displayName = 'Message';

/**
 * One entry in an imperative message stack. Extends the public props with the
 * stack bookkeeping fields (id, duration, placement).
 */
export interface MessageStackItem {
  id: string;
  content?: ReactNode;
  tone?: MessageTone;
  /** Auto-dismiss delay in ms; `0` keeps the message until closed. */
  duration: number;
  closable?: boolean;
  showIcon?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  placement?: MessagePlacement;
  className?: string;
  style?: StyleProperties;
  classNames?: MessageClassNames;
  styles?: MessageStyles;
  onClose?: () => void;
}

const DEFAULT_PLACEMENT: MessagePlacement = 'top';

function MessageItem({
  item,
  requestClose,
}: {
  item: MessageStackItem;
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
    <Message
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
    >
      {item.content}
    </Message>
  );
}

export interface MessageStackProps {
  items: readonly MessageStackItem[];
  requestClose: (id: string) => void;
}

/** Imperative stack renderer mounted by the message API host. */
export function MessageStack({ items, requestClose }: MessageStackProps) {
  const { t } = useLocale();
  if (items.length === 0) return null;
  const groups = new Map<MessagePlacement, MessageStackItem[]>();
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
          className="yuki-message-list"
          data-yuki-imperative-list="message"
          data-placement={placement}
          role="region"
          aria-label={t('message.region', { 'zh-CN': '消息', 'en-US': 'Messages' })}
        >
          {groupItems.map((item) => (
            <MessageItem key={item.id} item={item} requestClose={requestClose} />
          ))}
        </div>
      ))}
    </>
  );
}
