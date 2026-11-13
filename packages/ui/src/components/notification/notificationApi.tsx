import { type CSSProperties, type ReactNode } from 'react';
import { createImperativeHost, isNoticeOptions, nextImperativeId } from '../message/createImperativeHost';
import {
  NotificationStack,
  type NotificationClassNames,
  type NotificationPlacement,
  type NotificationStackItem,
  type NotificationStyles,
  type NotificationTone,
} from './Notification';

export interface NotificationOptions {
  /** Headline. */
  title?: ReactNode;
  /** Supporting copy. */
  description?: ReactNode;
  /** Semantic tone; drives the default icon and colour. @default 'info' */
  tone?: NotificationTone;
  /** Auto-dismiss delay in ms; `0` keeps the notification until closed. @default 4500 */
  duration?: number;
  /** Render a dismiss button. @default true */
  closable?: boolean;
  /** Show the leading tone icon. @default true */
  showIcon?: boolean;
  /** Replace the built-in tone icon. */
  icon?: ReactNode;
  /** Footer actions (buttons/links). */
  action?: ReactNode;
  /** Screen placement. @default 'topRight' */
  placement?: NotificationPlacement;
  /** Stable id used to close/update this notification. */
  key?: string;
  className?: string;
  style?: CSSProperties;
  classNames?: NotificationClassNames;
  styles?: NotificationStyles;
  /** Called when the notification is dismissed (automatically or manually). */
  onClose?: () => void;
}

export interface NotificationHandle {
  id: string;
  close: () => void;
  update: (options: Omit<NotificationOptions, 'key'>) => void;
}

export interface NotificationConfig {
  /** Default auto-dismiss delay in ms. */
  duration?: number;
  /** Default placement. */
  placement?: NotificationPlacement;
  /** Maximum concurrently visible notifications; oldest are removed first. `0` disables. */
  maxCount?: number;
  /** Default closable flag. */
  closable?: boolean;
}

const globalConfig: Required<Pick<NotificationConfig, 'duration' | 'placement' | 'maxCount'>> &
  Pick<NotificationConfig, 'closable'> = {
  duration: 4500,
  placement: 'topRight',
  maxCount: 0,
};

const host = createImperativeHost<NotificationStackItem>({
  name: 'notification',
  render: (items, remove) => <NotificationStack items={items} requestClose={remove} />,
});

function toItem(id: string, options: NotificationOptions): NotificationStackItem {
  return {
    id,
    title: options.title,
    description: options.description,
    tone: options.tone,
    duration: options.duration ?? globalConfig.duration,
    closable: options.closable ?? globalConfig.closable,
    showIcon: options.showIcon,
    icon: options.icon,
    action: options.action,
    placement: options.placement ?? globalConfig.placement,
    className: options.className,
    style: options.style,
    classNames: options.classNames,
    styles: options.styles,
    onClose: options.onClose,
  };
}

function open(input: NotificationOptions | ReactNode): NotificationHandle {
  const options = isNoticeOptions<NotificationOptions>(input) ? input : { title: input };
  const id = options.key ?? nextImperativeId('yuki-notification');
  host.push(toItem(id, options), globalConfig.maxCount);
  return {
    id,
    close: () => host.remove(id),
    update: (patch) => {
      const current = host.get(id);
      if (current) host.update(id, toItem(id, { ...current, ...patch }));
    },
  };
}

function themed(tone: NotificationTone) {
  return (options: NotificationOptions): NotificationHandle => open({ ...options, tone });
}

/**
 * Imperative notification API. Renders into the ConfigProvider popup container
 * and is SSR-safe (calls are no-ops without a DOM).
 */
export const notification = {
  /** Show a notification. */
  open,
  success: themed('success'),
  error: themed('error'),
  info: themed('info'),
  warning: themed('warning'),
  /** Loading notification; stays until closed or updated by default. */
  loading: (options: NotificationOptions): NotificationHandle =>
    open({ duration: 0, ...options, tone: 'loading' }),
  /** Close one notification by id, or every notification when omitted. */
  destroy(id?: string) {
    if (id !== undefined) host.remove(id);
    else host.destroy();
  },
  /** Update defaults for subsequently created notifications. */
  config(next: NotificationConfig) {
    if (next.duration !== undefined) globalConfig.duration = next.duration;
    if (next.placement !== undefined) globalConfig.placement = next.placement;
    if (next.maxCount !== undefined) globalConfig.maxCount = next.maxCount;
    if (next.closable !== undefined) globalConfig.closable = next.closable;
  },
};
