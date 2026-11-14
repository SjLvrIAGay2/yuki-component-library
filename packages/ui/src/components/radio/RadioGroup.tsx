import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useId,
  type ChangeEvent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useComponentSize, type Size } from '../../theme';
import { useFieldControl } from '../form/context';
import { Radio, type RadioProps } from './Radio';
import { RadioGroupContext, type RadioValue } from './context';

export interface RadioOption {
  label: ReactNode;
  value: RadioValue;
  disabled?: boolean;
  description?: ReactNode;
}

export interface RadioGroupClassNames {
  root?: string;
  /** Wrapper around each radio when `options` is used. */
  item?: string;
}

export interface RadioGroupStyles {
  root?: StyleProperties;
  item?: StyleProperties;
}

export interface RadioGroupProps
  extends Omit<
    WithStyle<HTMLAttributes<HTMLDivElement>>,
    'onChange' | 'defaultValue' | 'value' | 'children'
  > {
  value?: RadioValue;
  defaultValue?: RadioValue;
  /** Shorthand data mode. Plain strings / numbers become `{ label, value }`. */
  options?: Array<RadioOption | string | number>;
  direction?: 'horizontal' | 'vertical';
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  description?: ReactNode;
  error?: ReactNode;
  onValueChange?: (value: RadioValue) => void;
  optionProps?: (option: RadioOption, index: number) => WithStyle<HTMLAttributes<HTMLSpanElement>>;
  itemProps?: (option: RadioOption, index: number) => Partial<RadioProps>;
  descriptionProps?: (option: RadioOption, index: number) => WithStyle<HTMLAttributes<HTMLSpanElement>>;
  messageProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  disabled?: boolean;
  size?: Size;
  /** Shared native `name`; generated automatically when omitted. */
  name?: string;
  /** Called with the newly selected value. */
  onChange?: (value: RadioValue, event?: ChangeEvent<HTMLInputElement>) => void;
  children?: ReactNode;
  classNames?: RadioGroupClassNames;
  styles?: RadioGroupStyles;
}

function normalizeOptions(options: RadioGroupProps['options']): RadioOption[] {
  return (options ?? []).map((option) =>
    typeof option === 'string' || typeof option === 'number'
      ? { label: option, value: option }
      : option,
  );
}

/**
 * Single-select group (`role="radiogroup"`). All options share one native
 * `name`, so browsers give arrow-key navigation for free. Controlled and
 * uncontrolled, data-driven via `options` or free-form `<Radio>` children.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(props, ref) {
    const {
      value,
      defaultValue,
      options,
      orientation,
      direction = orientation ?? 'horizontal',
      label,
      description,
      error,
      onValueChange,
      optionProps,
      itemProps,
      descriptionProps,
      messageProps,
      disabled = false,
      size: sizeProp,
      name: nameProp,
      onChange,
      children,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = useComponentDefaults('RadioGroup', props);

    const size = useComponentSize(sizeProp);
    const autoName = useId();
    const name = nameProp ?? autoName;

    const field = useFieldControl<RadioValue>({
      value,
      disabled,
    });

    const [current, setCurrent] = useControllableState<RadioValue | null | undefined>({
      value: field.bound ? (field.value ?? null) : value,
      defaultValue,
    });

    const select = (next: RadioValue, event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(next, event);
      if (Object.is(current, next)) return;
      setCurrent(next);
      onValueChange?.(next);
      field.onChange?.(next);
    };

    const items = normalizeOptions(options);
    const message = error || description;
    const messageId = messageProps?.id ?? `${autoName}-message`;
    const describedBy = [rest['aria-describedby'], field.ariaProps['aria-describedby'], message ? messageId : undefined]
      .filter(Boolean).join(' ') || undefined;

    return (
      <RadioGroupContext.Provider
        value={{ value: current ?? undefined, disabled: field.disabled, name, select }}
      >
        <div
          {...rest}
          ref={ref}
          role="radiogroup"
          data-slot="radio-group"
          data-size={size}
          data-direction={direction}
          data-disabled={field.disabled || undefined}
          data-status={field.status}
          className={cx(
            'yuki-radio-group',
            `yuki-radio-group--${size}`,
            `yuki-radio-group--${direction}`,
            classNames?.root,
            className,
          )}
          style={{ ...styles?.root, ...style }}
          id={field.id ?? rest.id}
          aria-labelledby={rest['aria-labelledby'] ?? field.labelId}
          aria-label={rest['aria-label'] ?? label}
          onBlur={(event) => {
            rest.onBlur?.(event);
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) field.onBlur?.();
          }}
          aria-orientation={direction}
          aria-invalid={error || field.status === 'error' ? true : rest['aria-invalid']}
          aria-describedby={describedBy}
          aria-required={field.ariaProps['aria-required'] ?? rest['aria-required']}
          aria-busy={field.ariaProps['aria-busy'] ?? rest['aria-busy']}
        >
          {items.length > 0
            ? items.map((option, index) => {
                const wrapper = optionProps?.(option, index);
                const control = itemProps?.(option, index);
                const details = descriptionProps?.(option, index);
                const detailId = details?.id ?? `${autoName}-description-${index}`;
                return (
                  <span
                    {...wrapper}
                    key={String(option.value)}
                    data-slot="radio-group-item"
                    className={cx('yuki-radio-group__item', classNames?.item, wrapper?.className)}
                    style={{ ...styles?.item, ...wrapper?.style }}
                  >
                    <Radio
                      {...control}
                      value={option.value}
                      name={name}
                      size={control?.size ?? size}
                      disabled={option.disabled || control?.disabled}
                      aria-describedby={[control?.['aria-describedby'], option.description ? detailId : undefined].filter(Boolean).join(' ') || undefined}
                    >
                      {option.label}
                    </Radio>
                    {option.description && (
                      <span {...details} id={detailId} className={cx('yuki-radio-group__description', details?.className)}>
                        {option.description}
                      </span>
                    )}
                  </span>
                );
              })
            : children}
          {message && (
            <span {...messageProps} id={messageId} data-error={!!error} className={cx('yuki-radio-group__message', messageProps?.className)}>
              {message}
            </span>
          )}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
