import type { StyleProperties, WithStyle } from '../../styles/properties';
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
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useMergedRefs } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { useFieldControl, type FieldStatus } from '../form/context';
import { Icon } from '../icon/Icon';

export interface TextareaClassNames {
  root?: string;
  control?: string;
  clear?: string;
  count?: string;
}

export interface TextareaStyles {
  root?: StyleProperties;
  control?: StyleProperties;
  clear?: StyleProperties;
  count?: StyleProperties;
}

export interface TextareaAutoSize {
  minRows?: number;
  maxRows?: number;
}

export interface TextareaProps
  extends
    StandaloneFieldProps,
    Omit<
      WithStyle<TextareaHTMLAttributes<HTMLTextAreaElement>>,
      'size' | 'onChange' | 'value' | 'defaultValue'
    > {
  size?: Size;
  status?: FieldStatus;
  /** Grow with the content; `minRows` / `maxRows` bound the height. */
  autoSize?: boolean | TextareaAutoSize;
  footer?: ReactNode;
  allowClear?: boolean;
  onClear?: () => void;
  /** Show `current / maxLength` in the bottom-right corner. */
  showCount?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event?: ChangeEvent<HTMLTextAreaElement>) => void;
  classNames?: TextareaClassNames;
  styles?: TextareaStyles;
}

function clampRows(rows: number | undefined, fallback: number): number {
  return rows === undefined ? fallback : Math.max(rows, 1);
}

/**
 * Multi-line text field. Shares the Input token set, supports `autoSize`,
 * clear and character count, and binds to `Form.Item` through its context.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(inputProps, ref) {
    const defaults = useComponentDefaults('Textarea', inputProps);
    const {
      control: props,
      frame,
      fallbackId,
      controlClassName,
      controlStyle,
    } = useStandaloneField(defaults);
    const {
      size: sizeProp,
      status: statusProp,
      autoSize = false,
      footer,
      allowClear = false,
      onClear,
      showCount = false,
      value,
      defaultValue,
      onChange,
      className,
      style,
      classNames,
      styles,
      id,
      disabled,
      readOnly,
      maxLength,
      ...rest
    } = props;

    const size = useComponentSize(sizeProp);
    const { t } = useLocale();
    const controlRef = useRef<HTMLTextAreaElement | null>(null);
    const mergedRef = useMergedRefs(ref, controlRef);

    const field = useFieldControl<string>({
      value,
      id,
      disabled,
      status: frame.invalid ? 'error' : statusProp,
    });

    const controlId = field.id ?? fallbackId;
    const [current, setCurrent] = useControllableState<string>({
      value: field.bound ? ((field.value as string | undefined) ?? '') : value,
      defaultValue: defaultValue ?? '',
    });

    useEffect(() => {
      if (!autoSize) return;
      const node = controlRef.current;
      if (!node) return;
      const options = typeof autoSize === 'object' ? autoSize : {};
      node.style.height = 'auto';
      const computed = getComputedStyle(node);
      const lineHeight =
        Number.parseFloat(computed.lineHeight) || Number.parseFloat(computed.fontSize) * 1.5;
      const paddingBlock =
        Number.parseFloat(computed.paddingTop) + Number.parseFloat(computed.paddingBottom);
      const borderBlock = Number.parseFloat(computed.borderTopWidth) * 2;
      const minHeight = lineHeight * clampRows(options.minRows, 1) + paddingBlock + borderBlock;
      const maxHeight =
        options.maxRows === undefined
          ? Number.POSITIVE_INFINITY
          : lineHeight * clampRows(options.maxRows, 1) + paddingBlock + borderBlock;
      const next = Math.min(Math.max(node.scrollHeight, minHeight), maxHeight);
      node.style.height = `${next}px`;
      node.style.overflowY = node.scrollHeight > next ? 'auto' : 'hidden';
    }, [autoSize, current]);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const next = event.target.value;
      setCurrent(next);
      onChange?.(next, event);
      field.onChange?.(next);
    };

    const handleClear = () => {
      setCurrent('');
      onClear?.();
      onChange?.('');
      field.onChange?.('');
      controlRef.current?.focus();
    };

    const length = [...current].length;
    const status = field.status;
    const textareaRows =
      typeof autoSize === 'object' ? clampRows(autoSize.minRows, 2) : autoSize ? 2 : rest.rows;

    return (
      <StandaloneField
        frame={frame}
        id={controlId}
        hidden={rest.hidden}
        required={rest.required || field.required}
        footer={footer}
      >
        <div
          data-slot="textarea"
          data-size={size}
          data-status={status}
          data-disabled={field.disabled || undefined}
          data-readonly={readOnly || undefined}
          data-has-count={showCount || undefined}
          className={cx(
            'yuki-textarea',
            `yuki-textarea--${size}`,
            showCount && 'yuki-textarea--with-count',
            classNames?.root,
            className,
          )}
          style={{ ...styles?.root, ...style }}
        >
          <textarea
            {...rest}
            ref={mergedRef}
            rows={textareaRows}
            data-slot="control"
            className={cx('yuki-textarea__control', classNames?.control, controlClassName)}
            style={{ ...styles?.control, ...controlStyle }}
            id={controlId}
            value={current}
            maxLength={maxLength}
            disabled={field.disabled}
            readOnly={readOnly}
            {...field.ariaProps}
            aria-invalid={
              frame.invalid ||
              status === 'error' ||
              field.ariaProps['aria-invalid'] ||
              rest['aria-invalid']
            }
            aria-describedby={fieldDescription(
              frame,
              controlId,
              rest['aria-describedby'],
              field.ariaProps['aria-describedby'],
            )}
            onChange={handleChange}
            onBlur={(event) => {
              rest.onBlur?.(event);
              field.onBlur?.();
            }}
          />
          {allowClear && current.length > 0 && !field.disabled && !readOnly && (
            <button
              type="button"
              data-slot="clear"
              tabIndex={-1}
              className={cx('yuki-textarea__clear', classNames?.clear)}
              style={styles?.clear}
              aria-label={t('common.clear', { zh: '清除', en: 'Clear' })}
              onClick={handleClear}
            >
              <Icon name="x" />
            </button>
          )}
          {showCount && (
            <span
              data-slot="count"
              className={cx('yuki-textarea__count', classNames?.count)}
              style={styles?.count}
            >
              {maxLength === undefined ? length : `${length} / ${maxLength}`}
            </span>
          )}
        </div>
      </StandaloneField>
    );
  },
);

Textarea.displayName = 'Textarea';
