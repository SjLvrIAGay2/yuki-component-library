import { useAnimation, type AnimationOptions } from '../../animation';
import {
  StandaloneField,
  fieldDescription,
  useStandaloneField,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import {
  forwardRef,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import { useFieldControl } from '../form/context';

export interface SwitchClassNames {
  root?: string;
  input?: string;
  /** The pill. */
  track?: string;
  /** The moving knob. */
  handle?: string;
  /** Text inside the track (`checkedChildren` / `unCheckedChildren`). */
  label?: string;
  loading?: string;
}

export interface SwitchStyles {
  root?: CSSProperties;
  input?: CSSProperties;
  track?: CSSProperties;
  handle?: CSSProperties;
  label?: CSSProperties;
  loading?: CSSProperties;
}

export interface SwitchProps
  extends
    StandaloneFieldProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'size' | 'type' | 'onChange' | 'checked' | 'defaultChecked' | 'children'
    > {
  animation?: AnimationOptions | false;
  thumbProps?: HTMLAttributes<HTMLSpanElement>;
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called with the next checked state, not the DOM event. */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Defaults to the ConfigProvider size, then `md`. */
  size?: Size;
  disabled?: boolean;
  /** Shows a spinner and blocks interaction while true. */
  loading?: boolean;
  /** Text inside the track when checked. */
  checkedChildren?: ReactNode;
  /** Text inside the track when unchecked. */
  unCheckedChildren?: ReactNode;
  classNames?: SwitchClassNames;
  styles?: SwitchStyles;
}

/**
 * Binary toggle exposed as a native checkbox with `role="switch"` (Space works
 * for free). Controlled and uncontrolled; `Form.Item` binds it as a boolean.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(inputProps, ref) {
  const defaults = useComponentDefaults('Switch', inputProps);
  const {
    control: props,
    frame,
    fallbackId,
    controlClassName,
    controlStyle,
  } = useStandaloneField(defaults);
  const {
    checked,
    defaultChecked,
    onChange,
    size: sizeProp,
    disabled,
    loading = false,
    checkedChildren,
    unCheckedChildren,
    thumbProps,
    animation,
    classNames,
    styles,
    className,
    style,
    id,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const field = useFieldControl<boolean>({
    value: checked,
    id,
    disabled,
  });

  const controlId = field.id ?? fallbackId;
  const [current, setCurrent] = useControllableState<boolean>({
    value: field.bound ? Boolean(field.value) : checked,
    defaultValue: defaultChecked ?? false,
  });

  const { duration: _duration, delay: _delay, ...motion } = useAnimation(animation, 'feedback');
  const isDisabled = field.disabled || loading;
  const hasLabel = [checkedChildren, unCheckedChildren].some(
    (child) => child != null && typeof child !== 'boolean' && child !== '',
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    setCurrent(next);
    onChange?.(next, event);
    field.onChange?.(next);
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
        {...(animation === undefined ? {} : motion)}
        data-slot="switch"
        data-size={size}
        data-checked={current || undefined}
        data-disabled={isDisabled || undefined}
        data-loading={loading || undefined}
        data-has-label={hasLabel || undefined}
        className={cx(
          'yuki-switch',
          animation !== undefined && motion.className,
          `yuki-switch--${size}`,
          classNames?.root,
          className,
        )}
        style={{ ...(animation === undefined ? {} : motion.style), ...styles?.root, ...style }}
      >
        <input
          {...rest}
          ref={ref}
          id={controlId}
          type="checkbox"
          role="switch"
          data-slot="input"
          className={cx('yuki-switch__input', classNames?.input)}
          style={styles?.input}
          checked={current}
          onChange={handleChange}
          onBlur={(event) => {
            rest.onBlur?.(event);
            field.onBlur?.();
          }}
          disabled={isDisabled}
          aria-checked={current}
          aria-busy={loading || undefined}
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
          data-slot="track"
          aria-hidden="true"
          className={cx('yuki-switch__track', classNames?.track, controlClassName)}
          style={{ ...styles?.track, ...controlStyle }}
        >
          {hasLabel && (
            <span
              data-slot="label"
              className={cx('yuki-switch__label', classNames?.label)}
              style={styles?.label}
            >
              <span data-state="checked" data-visible={current}>{checkedChildren}</span>
              <span data-state="unchecked" data-visible={!current}>{unCheckedChildren}</span>
            </span>
          )}
          <span
            {...thumbProps}
            data-slot="handle"
            className={cx('yuki-switch__handle', classNames?.handle, thumbProps?.className)}
            style={{ ...styles?.handle, ...thumbProps?.style }}
          >
            {loading && (
              <span
                data-slot="loading"
                className={cx('yuki-switch__loading', classNames?.loading)}
                style={styles?.loading}
              >
                <Icon
                  name="refresh"
                  spin
                  aria-label={t('common.loading', { zh: '加载中', en: 'Loading' })}
                />
              </span>
            )}
          </span>
        </span>
      </label>
    </StandaloneField>
  );
});

Switch.displayName = 'Switch';
