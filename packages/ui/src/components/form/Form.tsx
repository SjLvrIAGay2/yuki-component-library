import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { useMergedRefs, usePrefersReducedMotion } from '../../hooks';
import { useComponentDefaults, useComponentSize, type Size } from '../../theme';
import { ComponentSizeScope } from '../../theme/ConfigProvider';
import { FormContext, useFormInstance, type FormLayout } from './FormContext';
import { FormItem } from './FormItem';
import { FormList } from './FormList';
import {
  nameToKey,
  useForm,
  type FormInstance,
  type Store,
  type ValidateError,
  type ValidateTrigger,
} from './useForm';

export interface FormClassNames {
  root?: string;
}

export interface FormStyles {
  root?: StyleProperties;
}

export interface FormProps<Values extends Store = Store>
  extends Omit<WithStyle<FormHTMLAttributes<HTMLFormElement>>, 'onFinish' | 'children' | 'onValuesChange'> {
  /** Adopt an external instance created by `Form.useForm()`. */
  form?: FormInstance<Values>;
  initialValues?: Partial<Values>;
  /** Called with the collected values once validation passes. */
  onFinish?: (values: Values) => void;
  /** Called with the first validation pass' errors. */
  onFinishFailed?: (errors: ValidateError[], values: Values) => void;
  /** Called after every field change (also fires for `setFieldsValue`). */
  onValuesChange?: (changed: Store, all: Values) => void;
  layout?: FormLayout;
  size?: Size;
  disabled?: boolean;
  /** Show the `*` before labels of required fields. Defaults to true. */
  requiredMark?: boolean;
  /** Append `:` to labels. */
  colon?: boolean;
  /** Default width of the label column in horizontal layout (CSS length). */
  labelWidth?: string | number;
  /** When field validation runs; `onSubmit` validates only on submit. */
  validateTrigger?: ValidateTrigger;
  children?: ReactNode;
  classNames?: FormClassNames;
  styles?: FormStyles;
}

function FormInner<Values extends Store = Store>(
  inputProps: FormProps<Values>,
  ref: Ref<HTMLFormElement>,
) {
  const props = useComponentDefaults('Form', inputProps);
  const {
    form: formProp,
    initialValues,
    onFinish,
    onFinishFailed,
    onValuesChange,
    layout = 'horizontal',
    size: sizeProp,
    disabled = false,
    requiredMark = true,
    colon = false,
    labelWidth,
    validateTrigger = 'onChange',
    children,
    classNames,
    styles,
    className,
    style,
    onSubmit,
    onReset,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const [internalForm] = useForm<Values>();
  const form = formProp ?? internalForm;
  const formRef = useRef<HTMLFormElement | null>(null);
  const mergedRef = useMergedRefs(ref, formRef);
  const reducedMotion = usePrefersReducedMotion();

  // Keep the latest callbacks available to the stable submit handler.
  const callbacksRef = useRef({ onFinish, onFinishFailed, onValuesChange });
  callbacksRef.current = { onFinish, onFinishFailed, onValuesChange };

  const initialised = useRef<FormInstance<Values>>();
  useEffect(() => {
    form.__setFormElement(formRef.current);
    form.__setCallbacks({
      onFinish: (values) => callbacksRef.current.onFinish?.(values as Values),
      onFinishFailed: (errors, values) =>
        callbacksRef.current.onFinishFailed?.(errors, values as Values),
      onValuesChange: (changed, all) =>
        callbacksRef.current.onValuesChange?.(changed, all as Values),
    });
    return () => {
      form.__setFormElement(null);
      form.__setCallbacks({});
    };
  }, [form]);

  useEffect(() => {
    if (initialised.current === form) return;
    initialised.current = form;
    form.__setInitialValues((initialValues ?? {}) as Store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const contextValue = useMemo(
    () => ({
      form: form as FormInstance,
      initialValues,
      layout,
      size,
      disabled,
      requiredMark,
      colon,
      validateTrigger,
      labelWidth,
    }),
    [form, initialValues, layout, size, disabled, requiredMark, colon, validateTrigger, labelWidth],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    void form
      .validateFields()
      .then((values) => {
        callbacksRef.current.onFinish?.(values);
      }, (error: { errors?: ValidateError[]; values?: Values }) => {
        const errors = error.errors ?? [];
        callbacksRef.current.onFinishFailed?.(errors, (error.values ?? {}) as Values);
        const first = errors[0];
        if (first && formRef.current) {
          const key = nameToKey(first.name);
          const node = Array.from(formRef.current.querySelectorAll<HTMLElement>('[data-field]'))
            .find(field => field.dataset.field === key);
          node?.scrollIntoView?.({
            block: 'center',
            behavior: reducedMotion ? 'auto' : 'smooth',
          });
        }
      });
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        {...rest}
        ref={mergedRef}
        noValidate
        data-slot="form"
        data-size={size}
        data-layout={layout}
        data-disabled={disabled || undefined}
        className={cx(
          'yuki-form',
          `yuki-form--${layout}`,
          classNames?.root,
          className,
        )}
        style={{
          ...(labelWidth === undefined
            ? undefined
            : {
                ['--yuki-form-label-width' as string]:
                  typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth,
              }),
          ...styles?.root,
          ...style,
        }}
        onSubmit={handleSubmit}
        onReset={(event) => {
          onReset?.(event);
          if (!event.defaultPrevented) form.resetFields();
        }}
      >
        <ComponentSizeScope size={sizeProp}>{children}</ComponentSizeScope>
      </form>
    </FormContext.Provider>
  );
}

export interface FormComponent {
  <Values extends Store = Store>(
    props: FormProps<Values> & { ref?: Ref<HTMLFormElement> },
  ): ReactElement | null;
  displayName?: string;
  Item: typeof FormItem;
  List: typeof FormList;
  useForm: typeof useForm;
  useFormInstance: typeof useFormInstance;
}

const FormBase = forwardRef(FormInner) as unknown as FormComponent;

export const Form = Object.assign(FormBase, {
  Item: FormItem,
  List: FormList,
  useForm,
  useFormInstance,
}) as FormComponent;

Form.displayName = 'Form';
