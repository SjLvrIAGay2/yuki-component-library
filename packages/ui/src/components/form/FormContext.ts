import { createContext, useContext } from 'react';
import type { Size } from '../../theme';
import type { FormInstance, Store, ValidateTrigger } from './useForm';

export type FormLayout = 'horizontal' | 'vertical' | 'inline';

export interface FormContextValue {
  form: FormInstance;
  layout: FormLayout;
  size: Size;
  initialValues?: Store;
  disabled: boolean;
  requiredMark: boolean;
  colon: boolean;
  validateTrigger: ValidateTrigger;
  labelWidth?: string | number;
}

export const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error(
      '[yuki-ui] Form.Item / Form.List must be rendered inside <Form>.',
    );
  }
  return context;
}

/** Access the closest `<Form form>` instance from any descendant. */
export function useFormInstance<Values extends Record<string, unknown> = Record<string, unknown>>() {
  return useFormContext().form as unknown as FormInstance<Values>;
}
