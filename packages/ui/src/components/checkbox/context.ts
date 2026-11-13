import { createContext, useContext } from 'react';
import type { CheckboxValue } from './Checkbox';

export interface CheckboxGroupContextValue {
  value: CheckboxValue[];
  disabled: boolean;
  name?: string;
  toggle: (value: CheckboxValue, checked: boolean) => void;
  ariaLabelledby?: string;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroup(): CheckboxGroupContextValue | null {
  return useContext(CheckboxGroupContext);
}
