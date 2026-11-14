import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type ChangeEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentSize, type Size } from '../../theme';
import { useFieldControl } from '../form/context';
import { Checkbox, type CheckboxValue } from './Checkbox';
import { CheckboxGroupContext } from './context';

export interface CheckboxOption {
  label: ReactNode;
  value: CheckboxValue;
  disabled?: boolean;
}

export interface CheckboxGroupClassNames {
  root?: string;
  /** Wrapper around each checkbox when `options` is used. */
  item?: string;
}

export interface CheckboxGroupStyles {
  root?: StyleProperties;
  item?: StyleProperties;
}

export interface CheckboxGroupProps
  extends Omit<
    WithStyle<HTMLAttributes<HTMLDivElement>>,
    'onChange' | 'defaultValue' | 'value' | 'children'
  > {
  value?: CheckboxValue[];
  defaultValue?: CheckboxValue[];
  /** Shorthand data mode. Plain strings / numbers become `{ label, value }`. */
  options?: Array<CheckboxOption | string | number>;
  /** Layout direction, horizontal by default. */
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  size?: Size;
  /** Shared native `name` applied to every checkbox. */
  name?: string;
  /** Called with the next array of checked values. */
  onChange?: (values: CheckboxValue[], event?: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  classNames?: CheckboxGroupClassNames;
  styles?: CheckboxGroupStyles;
}

function normalizeOptions(options: CheckboxGroupProps['options']): CheckboxOption[] {
  return (options ?? []).map((option) =>
    typeof option === 'string' || typeof option === 'number'
      ? { label: option, value: option }
      : option,
  );
}

/**
 * Groups checkboxes so they share one value array, one `disabled` state and one
 * horizontal / vertical layout. Works controlled and uncontrolled, with either
 * `options` data or free-form `<Checkbox>` children.
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup(props, ref) {
    const {
      value,
      defaultValue,
      options,
      direction = 'horizontal',
      disabled = false,
      size: sizeProp,
      name,
      onChange,
      children,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = props;

    const size = useComponentSize(sizeProp);
    const field = useFieldControl<CheckboxValue[]>({
      value,
      disabled,
    });

    const [current, setCurrent] = useControllableState<CheckboxValue[]>({
      value: field.bound ? ((field.value as CheckboxValue[] | undefined) ?? []) : value,
      defaultValue: defaultValue ?? [],
    });

    const toggle = (item: CheckboxValue, checked: boolean) => {
      const exists = current.some((entry) => Object.is(entry, item));
      let next: CheckboxValue[];
      if (checked && !exists) next = [...current, item];
      else if (!checked && exists) next = current.filter((entry) => !Object.is(entry, item));
      else next = current;
      setCurrent(next);
      onChange?.(next);
      field.onChange?.(next);
    };

    const items = normalizeOptions(options);

    return (
      <CheckboxGroupContext.Provider
        value={{ value: current, disabled: field.disabled, name, toggle }}
      >
        <div
          {...rest}
          ref={ref}
          id={field.id ?? rest.id}
          aria-labelledby={rest['aria-labelledby'] ?? field.labelId}
          {...field.ariaProps}
          role="group"
          data-slot="checkbox-group"
          data-size={size}
          data-direction={direction}
          data-disabled={field.disabled || undefined}
          className={cx(
            'yuki-checkbox-group',
            `yuki-checkbox-group--${size}`,
            `yuki-checkbox-group--${direction}`,
            classNames?.root,
            className,
          )}
          style={{ ...styles?.root, ...style }}
        >
          {items.length > 0
            ? items.map((option) => (
                <span
                  key={String(option.value)}
                  data-slot="checkbox-group-item"
                  className={cx('yuki-checkbox-group__item', classNames?.item)}
                  style={styles?.item}
                >
                  <Checkbox
                    value={option.value}
                    size={size}
                    name={name}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </Checkbox>
                </span>
              ))
            : children}
        </div>
      </CheckboxGroupContext.Provider>
    );
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';
