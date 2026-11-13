import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentSize, useLocale, type Size } from '../../theme';
import { ComponentSizeScope } from '../../theme/ConfigProvider';
import { FormItemControlContext, type FieldStatus } from './context';
import { useFormContext } from './FormContext';
import {
  getIn,
  nameToKey,
  runRules,
  toPath,
  type FormRule,
  type NamePath,
  type ValidateTrigger,
} from './useForm';

export interface FormItemClassNames {
  root?: string;
  label?: string;
  control?: string;
  help?: string;
  extra?: string;
}

export interface FormItemStyles {
  root?: CSSProperties;
  label?: CSSProperties;
  control?: CSSProperties;
  help?: CSSProperties;
  extra?: CSSProperties;
}

export interface FormItemRenderProps {
  id: string;
  status: FieldStatus;
  disabled: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  ariaProps: {
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    'aria-required'?: boolean;
    'aria-busy'?: boolean;
  };
}

export interface FormItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Field path: `'email'`, `'user.name'` is NOT supported — use `['user','name']`. */
  name?: NamePath;
  label?: ReactNode;
  /** Explanatory text rendered below the control. */
  extra?: ReactNode;
  /** Custom feedback text; overrides generated validation errors. */
  help?: ReactNode;
  rules?: FormRule[];
  /** Force the required marker / `aria-required` without a rule. */
  required?: boolean;
  /** Other fields that trigger re-validation of this one when they change. */
  dependencies?: NamePath[];
  validateTrigger?: ValidateTrigger | ValidateTrigger[];
  /** Use `initialValue` when resetting; overrides `Form.initialValues`. */
  initialValue?: unknown;
  /** Force a visual status regardless of validation. */
  validateStatus?: FieldStatus;
  /** Show the success look once the field is valid and touched. */
  hasFeedback?: boolean;
  /** Render only the control (no label / help / extra wrapper). */
  noStyle?: boolean;
  layout?: 'horizontal' | 'vertical' | 'inline';
  colon?: boolean;
  size?: Size;
  classNames?: FormItemClassNames;
  styles?: FormItemStyles;
  children?: ReactNode | ((control: FormItemRenderProps) => ReactNode);
}

const EMPTY: string[] = [];

/**
 * One form field: wires a control to the store, runs validation, renders label,
 * help and extra slots, and exposes the same binding through context so any
 * Yuki control composes without extra props.
 */
export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(function FormItem(
  props,
  ref,
) {
  const {
    name,
    label,
    extra,
    help,
    rules = [],
    required: requiredProp,
    dependencies = [],
    validateTrigger: validateTriggerProp,
    initialValue,
    validateStatus,
    hasFeedback = false,
    noStyle = false,
    layout: layoutProp,
    colon: colonProp,
    size: sizeProp,
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = props;

  const formContext = useFormContext();
  const { form, disabled: formDisabled, requiredMark, colon: formColon } = formContext;
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const layout = layoutProp ?? formContext.layout;
  const colon = colonProp ?? formColon;
  const id = useId();
  const key = name === undefined ? undefined : nameToKey(name);
  const path = name === undefined ? undefined : toPath(name);

  const [errors, setErrors] = useState<string[]>(EMPTY);
  const [validating, setValidating] = useState(false);
  const [touched, setTouched] = useState(false);
  const validationRun = useRef(0);
  const mountedRef = useRef(true);
  const errorsRef = useRef<string[]>(EMPTY);
  const validatingRef = useRef(false);
  const rulesRef = useRef(rules);
  rulesRef.current = rules;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setErrorsSafe = useCallback((next: string[]) => {
    errorsRef.current = next;
    if (mountedRef.current) setErrors(next);
  }, []);

  const setValidatingSafe = useCallback((next: boolean) => {
    validatingRef.current = next;
    if (mountedRef.current) setValidating(next);
  }, []);

  const getValue = useCallback(
    () => (key ? form.getFieldValue(name as NamePath) : undefined),
    [form, key, name],
  );

  const value = useSyncExternalStore(form.subscribe, getValue, () => {
    const stored = getValue();
    if (stored !== undefined || !path) return stored;
    return initialValue !== undefined ? initialValue : getIn(formContext.initialValues, path);
  });

  const validate = useCallback(async (): Promise<string[]> => {
    if (!key) return EMPTY;
    const run = ++validationRun.current;
    setValidatingSafe(true);
    try {
      const next = await runRules(
        form.getFieldValue(name as NamePath),
        rulesRef.current,
        form,
        t,
      );
      if (run === validationRun.current) setErrorsSafe(next);
      return next;
    } finally {
      if (run === validationRun.current) setValidatingSafe(false);
    }
  }, [form, key, name, t, setErrorsSafe, setValidatingSafe]);

  const validateRef = useRef(validate);
  validateRef.current = validate;
  const resetRef = useRef<() => void>(() => undefined);

  resetRef.current = () => {
    validationRun.current++;
    setErrorsSafe(EMPTY);
    setTouched(false);
    setValidatingSafe(false);
  };

  const dependenciesKey = JSON.stringify(dependencies);
  useEffect(() => {
    resetRef.current();
  }, [form, key]);

  useEffect(() => {
    if (!key || path === undefined) return;
    const unregister = form.__register({
      name: name as NamePath,
      key,
      dependencies,
      initialValue,
      validate: () => validateRef.current(),
      reset: () => resetRef.current(),
      getErrors: () => errorsRef.current,
      isValidating: () => validatingRef.current,
    });
    return unregister;
    // `name`/`initialValue` are captured on registration; key changes remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, key, dependenciesKey]);

  const triggerList = useMemo<ValidateTrigger[]>(() => {
    const trigger = validateTriggerProp ?? formContext.validateTrigger;
    return Array.isArray(trigger) ? trigger : [trigger];
  }, [validateTriggerProp, formContext.validateTrigger]);

  const handleChange = useCallback(
    (next: unknown) => {
      if (!key) return;
      form.setFieldValue(name as NamePath, next);
      setTouched(true);
      if (triggerList.includes('onChange')) void validateRef.current();
    },
    [form, key, name, triggerList],
  );

  const handleBlur = useCallback(() => {
    if (!key) return;
    setTouched(true);
    if (triggerList.includes('onBlur')) void validateRef.current();
  }, [key, triggerList]);

  const controlId = key ? `${id}-control` : id;
  const labelId = !noStyle && label != null ? id + '-label' : undefined;
  const helpId = `${id}-help`;
  const extraId = `${id}-extra`;

  const required = requiredProp ?? rules.some((rule) => rule.required || rule.whitespace);
  const invalid = errors.length > 0 || validateStatus === 'error';
  const status: FieldStatus = invalid
    ? 'error'
    : (validateStatus ?? (hasFeedback && touched && !validating ? 'success' : 'default'));

  const helpVisible = (help != null && help !== false && help !== '') || errors.length > 0;
  const describedBy = noStyle ? undefined :
    [helpVisible ? helpId : undefined, extra != null ? extraId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const ariaProps: FormItemRenderProps['ariaProps'] = {
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
    'aria-busy': validating || undefined,
  };

  const controlContext = useMemo(
    () => ({
      bound: key !== undefined,
      id: controlId,
      labelId,
      name: key,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      disabled: formDisabled,
      status,
      required,
      describedBy,
      invalid,
      validating,
    }),
    [
      key,
      controlId,
      labelId,
      value,
      handleChange,
      handleBlur,
      formDisabled,
      status,
      required,
      describedBy,
      invalid,
      validating,
    ],
  );

  const renderedChildren =
    typeof children === 'function'
      ? children({
          id: controlId,
          status,
          disabled: formDisabled,
          value,
          onChange: handleChange,
          onBlur: handleBlur,
          ariaProps,
        })
      : children;

  const control = (
    <FormItemControlContext.Provider value={controlContext}>
      <ComponentSizeScope size={sizeProp}>{renderedChildren}</ComponentSizeScope>
    </FormItemControlContext.Provider>
  );
  if (noStyle) return control;

  return (
    <div
      {...rest}
      ref={ref}
      data-slot="form-item"
      data-field={key}
      data-size={size}
      data-layout={layout}
      data-status={status === 'default' ? undefined : status}
      data-required={required || undefined}
      data-has-error={invalid || undefined}
      className={cx(
        'yuki-form-item',
        `yuki-form-item--${layout}`,
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {label !== undefined && label !== null && (
        <label
          data-slot="label"
          id={labelId}
          htmlFor={controlId}
          className={cx('yuki-form-item__label', classNames?.label)}
          style={styles?.label}
        >
          {required && requiredMark && (
            <span data-slot="required" aria-hidden="true" className="yuki-form-item__required">
              *
            </span>
          )}
          <span data-slot="label-text" className="yuki-form-item__label-text">
            {label}
          </span>
          {colon && (
            <span aria-hidden="true" className="yuki-form-item__colon">
              :
            </span>
          )}
        </label>
      )}
      <div
        data-slot="control"
        className={cx('yuki-form-item__control', classNames?.control)}
        style={styles?.control}
      >
        {control}
        {helpVisible && (
          <div
            data-slot="help"
            id={helpId}
            role={invalid ? 'alert' : undefined}
            className={cx('yuki-form-item__help', classNames?.help)}
            style={styles?.help}
          >
            {help ?? (errors.length > 1 ? errors.join('；') : errors[0])}
          </div>
        )}
        {extra !== undefined && extra !== null && (
          <div
            data-slot="extra"
            id={extraId}
            className={cx('yuki-form-item__extra', classNames?.extra)}
            style={styles?.extra}
          >
            {extra}
          </div>
        )}
      </div>
    </div>
  );
});

FormItem.displayName = 'FormItem';
