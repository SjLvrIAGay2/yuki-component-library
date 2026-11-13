import { createContext, useContext } from 'react';
import type { ChangeEvent } from 'react';

export type RadioValue = string | number | boolean;

export interface RadioGroupContextValue {
  value: RadioValue | undefined;
  disabled: boolean;
  name: string;
  select: (value: RadioValue, event: ChangeEvent<HTMLInputElement>) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroup(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}
