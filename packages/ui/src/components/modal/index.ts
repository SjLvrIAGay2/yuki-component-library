import { Modal as ModalComponent } from './Modal';
import { modal } from './modalApi';

/**
 * Modal dialog with imperative statics: `Modal.confirm/info/success/warning/error`
 * plus `Modal.destroy()`.
 */
export const Modal = Object.assign(ModalComponent, {
  confirm: modal.confirm,
  info: modal.info,
  success: modal.success,
  warning: modal.warning,
  error: modal.error,
  destroy: modal.destroy,
});

export type {
  ModalClassNames,
  ModalProps,
  ModalSize,
  ModalStyles,
} from './Modal';
export type { ModalMethodHandle, ModalMethodOptions } from './modalApi';
