import {
  forwardRef,
  useId,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { useFieldControl } from '../form/context';
import { useRadioGroup, type RadioValue } from './context';

export interface RadioClassNames {
  root?: string;
  input?: string;
  /** The circle. */
  control?: string;
  /** The inner dot. */
  dot?: string;
  label?: string;
}

export interface RadioStyles {
  root?: CSSProperties;
  input?: CSSProperties;
  control?: CSSProperties;
  dot?: CSSProperties;
  label?: CSSProperties;
}

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'onChange' | 'value' | 'checked' | 'defaultChecked' | 'children'
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called with the next state (true when selected). */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Identity inside a RadioGroup. */
  value?: RadioValue;
  disabled?: boolean;
  size?: Size;
  children?: ReactNode;
  classNames?: RadioClassNames;
  styles?: RadioStyles;
}

/**
 * Single radio option. Prefer using it inside `<RadioGroup>` so one value drives
 * every option and native arrow-key roving works; standalone usage behaves like
 * a regular controlled/uncontrolled input.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(inputProps, ref) {
  const props = useComponentDefaults('Radio', inputProps);
  const {
    checked,
    defaultChecked,
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
    name,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const group = useRadioGroup();
  const field = useFieldControl<boolean>({
    value: checked,
    id,
    disabled,
  });

  const [current, setCurrent] = useControllableState<boolean>({
    value: group ? undefined : field.bound ? Boolean(field.value) : checked,
    defaultValue: defaultChecked ?? false,
  });

  const itemValue = value ?? id ?? String(children ?? '');
  const isDisabled = (group ? group.disabled : field.disabled) || disabled === true;
  const isChecked = group
    ? group.value !== undefined && Object.is(group.value, itemValue)
    : current;
  const hasLabel = children !== undefined && children !== null && children !== '';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    if (group) {
      onChange?.(true, event);
      group.select(itemValue, event);
      return;
    }
    setCurrent(next);
    onChange?.(next, event);
    field.onChange?.(next);
  };

  return (
    <label
      data-slot="radio"
      data-size={size}
      data-disabled={isDisabled || undefined}
      data-checked={isChecked || undefined}
      className={cx(
        'yuki-radio',
        `yuki-radio--${size}`,
        !hasLabel && 'yuki-radio--no-label',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      <input
        {...rest}
        ref={ref}
        id={group ? id : field.id}
        type="radio"
        name={group?.name ?? name}
        data-slot="input"
        className={cx('yuki-radio__input', classNames?.input)}
        style={styles?.input}
        checked={isChecked}
        onChange={handleChange}
        disabled={isDisabled}
        value={typeof itemValue === 'string' || typeof itemValue === 'number' ? itemValue : undefined}
        aria-invalid={!group && field.status === 'error' ? true : undefined}
        {...(!group && field.bound ? field.ariaProps : {})}
      />
      <span
        data-slot="control"
        aria-hidden="true"
        className={cx('yuki-radio__control', classNames?.control)}
        style={styles?.control}
      >
        <span
          data-slot="dot"
          className={cx('yuki-radio__dot', classNames?.dot)}
          style={styles?.dot}
        />
      </span>
      {hasLabel ? (
        <span
          data-slot="label"
          className={cx('yuki-radio__label', classNames?.label)}
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
  );
});

Radio.displayName = 'Radio';
