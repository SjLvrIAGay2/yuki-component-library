import type { StyleProperties } from '../../styles/properties';
import { type ReactNode } from 'react';
import { createImperativeHost, nextImperativeId } from '../message/createImperativeHost';
import { useLocale } from '../../theme';
import { Icon, type IconName } from '../icon';
import { Modal, type ModalClassNames, type ModalSize, type ModalStyles } from './Modal';
import type { ButtonTone } from '../button';

/** Options accepted by `Modal.confirm` and its tone shortcuts. */
export interface ModalMethodOptions {
  /** Dialog headline. */
  title?: ReactNode;
  /** Dialog body. */
  content?: ReactNode;
  /** Extra copy rendered above the body. */
  description?: ReactNode;
  /** Replace the built-in tone icon; pass `null` to hide it. */
  icon?: ReactNode | null;
  /** Confirm button copy. */
  okText?: ReactNode;
  /** Cancel button copy. */
  cancelText?: ReactNode;
  /** Confirm button tone. */
  okTone?: ButtonTone;
  /** Show the header dismiss button. @default true */
  closable?: boolean;
  /** Close when the backdrop is pressed. @default true */
  maskClosable?: boolean;
  /** Width preset. @default 'md' */
  size?: ModalSize;
  /** Stable id used to close/update this dialog. */
  key?: string;
  className?: string;
  style?: StyleProperties;
  classNames?: ModalClassNames;
  styles?: ModalStyles;
  /** Called when the confirm button is pressed; return a promise to keep the button loading. */
  onOk?: () => void | Promise<void>;
  /** Called when the dialog is dismissed. */
  onCancel?: () => void;
}

export interface ModalMethodHandle {
  id: string;
  destroy: () => void;
  update: (options: Partial<ModalMethodOptions>) => void;
}

type ModalTone = 'confirm' | 'info' | 'success' | 'error' | 'warning';

interface ModalMethodItem {
  id: string;
  tone: ModalTone;
  options: ModalMethodOptions;
}

const TONE_ICONS: Record<ModalTone, IconName> = {
  confirm: 'help-circle',
  info: 'info',
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
};

const TONE_OK: Record<ModalTone, ButtonTone> = {
  confirm: 'primary',
  info: 'primary',
  success: 'success',
  error: 'danger',
  warning: 'warning',
};

function toneColorVar(tone: ModalTone): string {
  switch (tone) {
    case 'success':
      return 'var(--yuki-color-success)';
    case 'error':
      return 'var(--yuki-color-danger)';
    case 'warning':
      return 'var(--yuki-color-warning)';
    default:
      return 'var(--yuki-color-primary)';
  }
}

function ModalMethodDialog({
  item,
  remove,
}: {
  item: ModalMethodItem;
  remove: (id: string) => void;
}) {
  const { t } = useLocale();
  const { options, tone } = item;
  const iconNode =
    options.icon !== undefined ? options.icon : <Icon name={TONE_ICONS[tone]} size="lg" />;

  return (
    <Modal
      defaultOpen
      onOpenChange={(open) => {
        if (!open) remove(item.id);
      }}
      title={options.title ?? t('modal.confirm', { 'zh-CN': '确认', 'en-US': 'Confirm' })}
      description={options.description}
      footer={undefined}
      okText={options.okText}
      cancelText={options.cancelText}
      okTone={options.okTone ?? TONE_OK[tone]}
      closable={options.closable}
      maskClosable={options.maskClosable}
      size={options.size ?? 'sm'}
      className={options.className}
      style={options.style}
      classNames={options.classNames}
      styles={options.styles}
      onCancel={() => {
        options.onCancel?.();
        remove(item.id);
      }}
      onOk={options.onOk}
    >
      <div className="yuki-modal-confirm" data-slot="content" data-tone={tone}>
        {iconNode != null && (
          <span
            className="yuki-modal-confirm__icon"
            data-slot="icon"
            aria-hidden="true"
            style={{ color: toneColorVar(tone) }}
          >
            {iconNode}
          </span>
        )}
        <div className="yuki-modal-confirm__body" data-slot="body">
          {options.content}
        </div>
      </div>
    </Modal>
  );
}

const host = createImperativeHost<ModalMethodItem>({
  name: 'modal',
  render: (items, remove) =>
    items.map((item) => <ModalMethodDialog key={item.id} item={item} remove={remove} />),
});

function open(tone: ModalTone, options: ModalMethodOptions): ModalMethodHandle {
  const id = options.key ?? nextImperativeId(`yuki-modal-${tone}`);
  host.push({ id, tone, options });
  return {
    id,
    destroy: () => host.remove(id),
    update: (patch) => {
      const current = host.get(id);
      if (!current) return;
      host.update(id, { options: { ...current.options, ...patch } });
    },
  };
}

/** Imperative modal API; exposed as statics on the `Modal` component. */
export const modal = {
  /** Open a dialog with the confirm tone. */
  confirm: (options: ModalMethodOptions): ModalMethodHandle => open('confirm', options),
  info: (options: ModalMethodOptions): ModalMethodHandle => open('info', options),
  success: (options: ModalMethodOptions): ModalMethodHandle => open('success', options),
  warning: (options: ModalMethodOptions): ModalMethodHandle => open('warning', options),
  error: (options: ModalMethodOptions): ModalMethodHandle => open('error', options),
  /** Close one dialog by id, or every open dialog when omitted. */
  destroy(id?: string) {
    if (id !== undefined) host.remove(id);
    else host.destroy();
  },
};
