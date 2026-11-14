import type { StyleProperties } from '../../styles/properties';
import { type ReactNode } from 'react';
import {
  createImperativeHost,
  isNoticeOptions,
  nextImperativeId,
} from './createImperativeHost';
import {
  MessageStack,
  type MessageClassNames,
  type MessagePlacement,
  type MessageStackItem,
  type MessageStyles,
  type MessageTone,
} from './Message';

export interface MessageOptions {
  /** Message body. */
  content?: ReactNode;
  /** Semantic tone; drives the default icon and colour. @default 'info' */
  tone?: MessageTone;
  /** Auto-dismiss delay in ms; `0` keeps the message until closed. @default 3000 */
  duration?: number;
  /** Render a dismiss button. */
  closable?: boolean;
  /** Show the leading tone icon. @default true */
  showIcon?: boolean;
  /** Replace the built-in tone icon. */
  icon?: ReactNode;
  /** Inline action node rendered after the content. */
  action?: ReactNode;
  /** Screen placement. @default 'top' */
  placement?: MessagePlacement;
  /** Stable id used to close/update this message. */
  key?: string;
  className?: string;
  style?: StyleProperties;
  classNames?: MessageClassNames;
  styles?: MessageStyles;
  /** Called when the message is dismissed (automatically or manually). */
  onClose?: () => void;
}

export interface MessageHandle {
  id: string;
  close: () => void;
  update: (options: Omit<MessageOptions, 'key'>) => void;
}

export interface MessageConfig {
  /** Default auto-dismiss delay in ms. */
  duration?: number;
  /** Default placement. */
  placement?: MessagePlacement;
  /** Maximum concurrently visible messages; oldest are removed first. `0` disables. */
  maxCount?: number;
  /** Default closable flag. */
  closable?: boolean;
}

const globalConfig: Required<Pick<MessageConfig, 'duration' | 'placement' | 'maxCount'>> &
  Pick<MessageConfig, 'closable'> = {
  duration: 3000,
  placement: 'top',
  maxCount: 0,
};

const host = createImperativeHost<MessageStackItem>({
  name: 'message',
  render: (items, remove) => <MessageStack items={items} requestClose={remove} />,
});

function toItem(id: string, options: MessageOptions): MessageStackItem {
  return {
    id,
    content: options.content,
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

function open(input: MessageOptions | ReactNode): MessageHandle {
  const options = isNoticeOptions<MessageOptions>(input) ? input : { content: input };
  const id = options.key ?? nextImperativeId('yuki-message');
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

function themed(tone: MessageTone) {
  return (content: ReactNode, options?: MessageOptions): MessageHandle =>
    open({ ...options, content, tone });
}

/**
 * Imperative message API. Renders into the ConfigProvider popup container and
 * is SSR-safe (calls are no-ops without a DOM).
 */
export const message = {
  /** Show a message; pass options or just the content. */
  open,
  success: themed('success'),
  error: themed('error'),
  info: themed('info'),
  warning: themed('warning'),
  /** Loading message; stays until closed or updated by default. */
  loading: (content: ReactNode, options?: MessageOptions): MessageHandle =>
    open({ duration: 0, ...options, content, tone: 'loading' }),
  /** Close one message by id, or every message when omitted. */
  destroy(id?: string) {
    if (id !== undefined) host.remove(id);
    else host.destroy();
  },
  /** Update defaults for subsequently created messages. */
  config(next: MessageConfig) {
    if (next.duration !== undefined) globalConfig.duration = next.duration;
    if (next.placement !== undefined) globalConfig.placement = next.placement;
    if (next.maxCount !== undefined) globalConfig.maxCount = next.maxCount;
    if (next.closable !== undefined) globalConfig.closable = next.closable;
  },
};

/** Alias for the imperative API. */
export const toast = message;
