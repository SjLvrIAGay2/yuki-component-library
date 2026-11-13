import { createContext, forwardRef, useContext, useState, type ComponentPropsWithoutRef } from 'react';
import * as Primitive from '@radix-ui/react-accordion';
import type { AnimationOptions } from '../../animation';

type PrimitiveProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
type MultipleProps = Omit<Extract<PrimitiveProps, { type: 'multiple' }>, 'type'> & { type?: 'multiple' };
export type RootProps = MultipleProps | Extract<PrimitiveProps, { type: 'single' }>;
export const AccordionContext = createContext<{ values: string[]; animation?: AnimationOptions | false }>({
  values: [],
});

// Both presentations use the same Radix collection for selection, disabled items and keyboard navigation.
export const AccordionRoot = forwardRef<HTMLDivElement, RootProps & { animation?: AnimationOptions | false }>(
  function AccordionRoot({ animation, ...props }, ref) {
    const [uncontrolled, setUncontrolled] = useState<string | string[]>(props.defaultValue ?? []);
    const value = props.value ?? uncontrolled;
    const values = Array.isArray(value) ? value : value ? [value] : [];

    return (
      <AccordionContext.Provider value={{ values, animation }}>
        {props.type === 'single' ? (
          <Primitive.Root
            {...props}
            ref={ref}
            value={values[0] ?? ''}
            onValueChange={(next: string) => {
              if (props.value === undefined) setUncontrolled(next);
              props.onValueChange?.(next);
            }}
          />
        ) : (
          <Primitive.Root
            {...props}
            type="multiple"
            ref={ref}
            value={values}
            onValueChange={(next: string[]) => {
              if (props.value === undefined) setUncontrolled(next);
              props.onValueChange?.(next);
            }}
          />
        )}
      </AccordionContext.Provider>
    );
  },
);

export function usePanelOpen(value: string) {
  return useContext(AccordionContext).values.includes(value);
}

