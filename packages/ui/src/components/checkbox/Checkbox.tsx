import {
  StandaloneField,
  fieldDescription,
  useStandaloneField,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useMergedRefs } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { useFieldControl } from '../form/context';
import { CheckboxGroupContext, useCheckboxGroup } from './context';

export type CheckboxValue = string | number | boolean;

export interface CheckboxClassNames {
  root?: string;
  input?: string;
  /** The 16px visual box (contains the check mark). */
  control?: string;
  label?: string;
}

export interface CheckboxStyles {
  root?: CSSProperties;
  input?: CSSProperties;
  control?: CSSProperties;
  label?: CSSProperties;
}

export interface CheckboxProps
  extends
    StandaloneFieldProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'size' | 'type' | 'onChange' | 'value' | 'defaultChecked' | 'checked' | 'children'
    > {
  indicator?: ReactNode;
  indicatorProps?: HTMLAttributes<HTMLSpanElement>;
  descriptionProps?: HTMLAttributes<HTMLParagraphElement>;
  checked?: boolean;
  defaultChecked?: boolean;
  /** Half-checked visual + `aria-checked="mixed"`. Table / Tree use this. */
  indeterminate?: boolean;
  /** Called with the next checked state, not the DOM event. */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Identity inside a CheckboxGroup. */
  value?: CheckboxValue;
  disabled?: boolean;
  size?: Size;
  /** Label content, rendered inside the `<label>` so it toggles the box. */
  children?: ReactNode;
  classNames?: CheckboxClassNames;
  styles?: CheckboxStyles;
}

/**
 * Checkbox with optional group binding.
 *
 * Root is a `<label data-slot="checkbox">`; attributes such as `name`,
 * `aria-label` and `required` go to the native input so form/AT semantics keep
 * working. Without `children` the label is visually hidden (icon-only box) and
 * you should pass `aria-label`.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(inputProps, ref) {
    const defaults = useComponentDefaults('Checkbox', inputProps);
    const {
      control: props,
      frame,
      fallbackId,
      controlClassName,
      controlStyle,
    } = useStandaloneField({
      ...defaults,
      messageProps: defaults.messageProps ?? defaults.descriptionProps,
    });
    const {
      checked,
      defaultChecked,
      indeterminate = false,
      indicator,
      indicatorProps,
      descriptionProps: _descriptionProps,
      onChange,
      value,
      disabled,
      size: sizeProp,
      children,
      classNames,
      styles,
      className,
      style,
      id,
      ...rest
    } = props;

    const size = useComponentSize(sizeProp);
    const { t } = useLocale();
    const group = useCheckboxGroup();
    const inputRef = useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRefs(ref, inputRef);

    const field = useFieldControl<boolean>({
      value: checked,
      id,
      disabled,
    });

    const groupValue = value ?? id ?? String(children ?? frame.label ?? '');
    const groupChecked = group
      ? group.value.some((item) => Object.is(item, groupValue))
      : undefined;

    const controlId = (group ? id : field.id) ?? fallbackId;
    const [current, setCurrent] = useControllableState<boolean>({
      value: group ? groupChecked : field.bound ? Boolean(field.value) : checked,
      defaultValue: defaultChecked ?? false,
    });

    const isDisabled = field.disabled || (group?.disabled ?? false);
    const hasLabel = children !== undefined && children !== null && children !== '';

    // `indeterminate` has no HTML attribute; it must be set on the DOM node.
    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.checked;
      setCurrent(next);
      onChange?.(next, event);
      if (group) group.toggle(groupValue, next);
      else field.onChange?.(next);
    };

    return (
      <StandaloneField
        frame={frame}
        id={controlId}
        hidden={rest.hidden}
        required={rest.required || field.required}
        inline
      >
        <label
          data-slot="checkbox"
          data-size={size}
          data-disabled={isDisabled || undefined}
          data-checked={current || undefined}
          data-indeterminate={indeterminate || undefined}
          className={cx(
            'yuki-checkbox',
            `yuki-checkbox--${size}`,
            !hasLabel && 'yuki-checkbox--no-label',
            classNames?.root,
            className,
          )}
          style={{ ...styles?.root, ...style }}
        >
          <input
            {...rest}
            ref={mergedRef}
            id={controlId}
            name={props.name ?? group?.name}
            type="checkbox"
            data-slot="input"
            className={cx('yuki-checkbox__input', classNames?.input)}
            style={styles?.input}
            checked={current}
            onChange={handleChange}
            onBlur={(event) => {
              rest.onBlur?.(event);
              field.onBlur?.();
            }}
            disabled={isDisabled}
            value={typeof value === 'string' || typeof value === 'number' ? value : undefined}
            aria-checked={indeterminate ? 'mixed' : undefined}
            {...field.ariaProps}
            aria-labelledby={
              rest['aria-labelledby'] ??
              (frame.hasLabel ? (frame.labelProps?.id ?? controlId + '-label') : undefined)
            }
            aria-invalid={
              frame.invalid ||
              field.status === 'error' ||
              field.ariaProps['aria-invalid'] ||
              rest['aria-invalid']
            }
            aria-describedby={fieldDescription(
              frame,
              controlId,
              rest['aria-describedby'],
              field.ariaProps['aria-describedby'],
            )}
          />
          <span
            {...indicatorProps}
            data-slot="control"
            aria-hidden="true"
            className={cx(
              'yuki-checkbox__control',
              classNames?.control,
              controlClassName,
              indicatorProps?.className,
            )}
            style={{ ...styles?.control, ...controlStyle, ...indicatorProps?.style }}
          >
            {indicator !== undefined ? (
              (indeterminate || current) && indicator
            ) : indeterminate ? (
              <Icon name="minus" className="yuki-checkbox__mark" />
            ) : (
              <Icon name="check" className="yuki-checkbox__mark" />
            )}
          </span>
          {hasLabel ? (
            <span
              data-slot="label"
              className={cx('yuki-checkbox__label', classNames?.label)}
              style={styles?.label}
            >
              {children}
            </span>
          ) : (
            <span className="yuki-visually-hidden">
              {t('common.select', { zh: '选择', en: 'Select' })}
            </span>
          )}
        </label>
      </StandaloneField>
    );
  },
);

Checkbox.displayName = 'Checkbox';
