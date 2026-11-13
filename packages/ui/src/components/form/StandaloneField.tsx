import {
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';

export interface StandaloneFieldProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  fieldProps?: HTMLAttributes<HTMLDivElement>;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  messageProps?: HTMLAttributes<HTMLParagraphElement>;
  controlClassName?: string;
  controlStyle?: CSSProperties;
}

function hasContent(content: ReactNode): boolean {
  return content != null && typeof content !== 'boolean' && content !== '';
}

/** Extract field-only props so they never leak to the native control. */
export function useStandaloneField<P extends StandaloneFieldProps>(props: P) {
  const generatedId = useId();
  const {
    label,
    description,
    error,
    fieldProps,
    labelProps,
    messageProps,
    controlClassName,
    controlStyle,
    ...control
  } = props;
  const invalid = hasContent(error);
  const message = invalid ? error : description;
  const hasLabel = hasContent(label);
  const hasMessage = hasContent(message);
  // Keep the same control mounted while a caller toggles validation feedback.
  const active =
    'label' in props || 'description' in props || 'error' in props || Boolean(fieldProps);
  return {
    control,
    controlClassName,
    controlStyle,
    frame: {
      label,
      message,
      invalid,
      fieldProps,
      labelProps,
      messageProps,
      hasLabel,
      hasMessage,
      active,
    },
    fallbackId: active ? generatedId : undefined,
  };
}

type Frame = ReturnType<typeof useStandaloneField>['frame'];

export function fieldDescription(
  frame: Frame,
  id: string | undefined,
  ...ids: Array<string | undefined>
) {
  if (frame.hasMessage && id) ids.push(frame.messageProps?.id ?? id + '-message');
  return (
    [...new Set(ids.flatMap((value) => value?.split(/\s+/) ?? []).filter(Boolean))].join(' ') ||
    undefined
  );
}

export function StandaloneField({
  frame,
  id,
  inline,
  hidden,
  required,
  footer,
  focusControl,
  children,
}: {
  frame: Frame;
  id?: string;
  inline?: boolean;
  hidden?: boolean;
  required?: boolean;
  footer?: ReactNode;
  /** A div-based combobox needs an explicit focus action from its label. */
  focusControl?: () => void;
  children: ReactNode;
}) {
  if (!frame.active && !hasContent(footer) && !hidden) return <>{children}</>;
  const { fieldProps, labelProps, messageProps } = frame;
  const label = frame.hasLabel && (
    <label
      {...labelProps}
      htmlFor={id}
      id={labelProps?.id ?? id + '-label'}
      className={cx('yuki-standalone-field__label', labelProps?.className)}
      onClick={(event) => {
        labelProps?.onClick?.(event);
        if (!event.defaultPrevented) focusControl?.();
      }}
    >
      {frame.label}
      {required && (
        <span className="yuki-form-item__required" aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </label>
  );
  return (
    <div
      {...fieldProps}
      hidden={hidden || fieldProps?.hidden}
      className={cx(
        'yuki-standalone-field',
        inline && 'yuki-standalone-field--inline',
        fieldProps?.className,
      )}
    >
      {inline ? (
        <div className="yuki-standalone-field__row">
          {children}
          {label}
        </div>
      ) : (
        <>
          {label}
          {children}
        </>
      )}
      {frame.hasMessage && (
        <p
          {...messageProps}
          id={messageProps?.id ?? id + '-message'}
          role={messageProps?.role ?? (frame.invalid ? 'alert' : undefined)}
          data-invalid={frame.invalid || undefined}
          className={cx('yuki-standalone-field__message', messageProps?.className)}
        >
          {frame.message}
        </p>
      )}
      {footer}
    </div>
  );
}
