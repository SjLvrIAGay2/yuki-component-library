import { createContext, useContext } from 'react';
import { FormContext } from './FormContext';

/**
 * Visual validation status shared by every form control.
 *
 * `default` is the resting state; the other three map to the status colours
 * and are also what `Form.Item` injects when a field fails validation.
 */
export type FieldStatus = 'default' | 'error' | 'warning' | 'success';

/**
 * What `Form.Item` publishes to the control it renders.
 *
 * Controls read this through `useFieldControl`. Keeping the contract here (and
 * not in each control) means every input in the library binds to forms the
 * same way and none of them need to know about `useForm` internals.
 */
export interface FormItemControlContextValue {
  /** True when a `Form.Item name` owns the control. */
  bound: boolean;
  /** Stable id shared by the label and the control. */
  id?: string;
  labelId?: string;
  /** Field path (already stringified). */
  name?: string;
  /** Current field value from the form store. */
  value?: unknown;
  /** Write the next value back to the form store. */
  onChange?: (value: unknown) => void;
  /** Notify the form store that the field was blurred (may trigger validation). */
  onBlur?: () => void;
  disabled?: boolean;
  status?: FieldStatus;
  /** Truthy when a `required` rule is present. */
  required?: boolean;
  /** Space-joined ids of the help/extra nodes. */
  describedBy?: string;
  /** Validation failed — controls map this to `aria-invalid`. */
  invalid?: boolean;
  /** Validation is running — controls may map this to `aria-busy`. */
  validating?: boolean;
}

export const FormItemControlContext =
  createContext<FormItemControlContextValue | null>(null);

export interface FieldControlOptions<T> {
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  id?: string;
  disabled?: boolean;
  status?: FieldStatus;
}

export interface FieldControlBinding<T> {
  /** True when the control is owned by a `Form.Item name`. */
  bound: boolean;
  id: string | undefined;
  labelId?: string;
  value: T | undefined;
  onChange: ((value: T) => void) | undefined;
  onBlur: (() => void) | undefined;
  disabled: boolean;
  status: FieldStatus;
  required: boolean;
  /** Spread onto the focusable element / fieldset. */
  ariaProps: {
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    'aria-required'?: boolean;
    'aria-busy'?: boolean;
  };
}

/**
 * Merge a control's own props with the surrounding `Form.Item` binding.
 *
 * Rules:
 * - a bound field owns `value` / `onChange` / `onBlur` and the accessibility
 *   wiring, but the consumer's own `onChange`/`onBlur` still fire;
 * - an explicit `disabled` or `status` never overrides a disabled field —
 *   form-level disabling always wins;
 * - outside a form everything falls back to plain props.
 */
export function useFieldControl<T>(
  options: FieldControlOptions<T> = {},
): FieldControlBinding<T> {
  const item = useContext(FormItemControlContext);
  const form = useContext(FormContext);
  const bound = item?.bound === true;

  const onChange = (next: T) => {
    options.onChange?.(next);
    if (bound) item?.onChange?.(next);
  };

  const onBlur = () => {
    options.onBlur?.();
    if (bound) item?.onBlur?.();
  };

  const disabled = options.disabled === true || form?.disabled === true || item?.disabled === true;

  const status: FieldStatus =
    item?.invalid ? 'error' : options.status ?? item?.status ?? 'default';

  const required = item?.required === true;

  const ariaProps: FieldControlBinding<T>['ariaProps'] = {};
  if (item?.invalid) ariaProps['aria-invalid'] = true;
  if (item?.describedBy) ariaProps['aria-describedby'] = item.describedBy;
  if (item?.required) ariaProps['aria-required'] = true;
  if (item?.validating) ariaProps['aria-busy'] = true;

  return {
    bound,
    id: bound || item?.labelId ? item?.id : options.id,
    labelId: item?.labelId,
    value: bound ? (item?.value as T | undefined) : options.value,
    onChange,
    onBlur,
    disabled,
    status,
    required,
    ariaProps,
  };
}
