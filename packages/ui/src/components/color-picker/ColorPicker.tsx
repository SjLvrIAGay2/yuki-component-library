import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  StandaloneField,
  useStandaloneField,
  fieldDescription,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import { FormItemControlContext, useFieldControl } from '../form/context';
import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../internal/cx';
import { Popup } from '../../internal/Popup';
import { useClickOutside, useControllableState, useEscapeKey, useEventCallback } from '../../hooks';
import { useComponentSize, useLocale, type Size } from '../../theme';
import { Button } from '../button';
import { Icon } from '../icon';
import { Input } from '../input';
import {
  formatColor,
  parseColor,
  toCssColor,
  toHex,
  type ColorPickerFormat,
  type RgbaColor,
} from './color-utils';

/** Default swatch grid: a spread of hues plus black and white. */
const DEFAULT_PRESETS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

export interface ColorPickerClassNames {
  root?: string;
  trigger?: string;
  swatch?: string;
  value?: string;
  indicator?: string;
  panel?: string;
  presets?: string;
  preset?: string;
  inputRow?: string;
  preview?: string;
  input?: string;
  alpha?: string;
  alphaInput?: string;
  alphaValue?: string;
  footer?: string;
  clear?: string;
}

export interface ColorPickerStyles {
  root?: StyleProperties;
  trigger?: StyleProperties;
  swatch?: StyleProperties;
  value?: StyleProperties;
  indicator?: StyleProperties;
  panel?: StyleProperties;
  presets?: StyleProperties;
  preset?: StyleProperties;
  inputRow?: StyleProperties;
  preview?: StyleProperties;
  input?: StyleProperties;
  alpha?: StyleProperties;
  alphaInput?: StyleProperties;
  alphaValue?: StyleProperties;
  footer?: StyleProperties;
  clear?: StyleProperties;
}

export interface ColorPickerProps
  extends StandaloneFieldProps, Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'defaultValue'> {
  name?: string;
  /** Controlled colour string (any supported format). */
  value?: string;
  /** Initial colour when uncontrolled. */
  defaultValue?: string;
  /** Fired on every colour change. */
  onChange?: (value: string, color: RgbaColor | null) => void;
  /** Fired after an input is committed (blur/Enter, preset click, clear). */
  onChangeComplete?: (value: string, color: RgbaColor | null) => void;
  /** Text format used for the value / emitted strings. */
  format?: ColorPickerFormat;
  /** Allow translucent colours (8-digit hex / `rgba(...)` / alpha slider). */
  alpha?: boolean;
  /** Preset swatches shown above the input. */
  presets?: string[];
  /** Show a clear action in the panel footer. */
  allowClear?: boolean;
  disabled?: boolean;
  /** Controlled panel visibility. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Placeholder for the empty state (defaults to a locale string). */
  placeholder?: string;
  size?: Size;
  classNames?: ColorPickerClassNames;
  styles?: ColorPickerStyles;
}

const SLOT = 'yuki-color-picker';

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(inputProps, ref) {
    const {
      control: props,
      frame,
      controlClassName,
      controlStyle,
    } = useStandaloneField(useComponentDefaults('ColorPicker', inputProps));
    const {
      value,
      defaultValue = '',
      onChange,
      onChangeComplete,
      format = 'hex',
      alpha = false,
      presets = DEFAULT_PRESETS,
      allowClear = false,
      disabled: disabledProp = false,
      name,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      placeholder,
      size,
      className,
      style,
      classNames,
      styles,
      ...rest
    } = props;

    const { t } = useLocale();
    const field = useFieldControl<string>({ value, disabled: disabledProp });
    const disabled = field.disabled;
    const resolvedSize = useComponentSize(size);

    const notifyChange = useEventCallback((next: string) => {
      onChange?.(next, parseColor(next));
      field.onChange?.(next);
    });

    const [currentValue, setCurrentValue] = useControllableState<string>({
      value: field.bound ? (field.value ?? '') : value,
      defaultValue,
      onChange: notifyChange,
    });

    const [requestedOpen, setOpen] = useControllableState<boolean>({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });

    const open = requestedOpen && !disabled && !rest.hidden && !frame.fieldProps?.hidden;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const baseId = useId();
    const triggerId = field.id ?? baseId + '-trigger';
    const panelId = `${baseId}-panel`;

    const color = useMemo(() => (currentValue ? parseColor(currentValue) : null), [currentValue]);

    const formatted = color ? formatColor(color, format, alpha) : '';
    const [draft, setDraft] = useState(() => defaultValue || '');
    const [editing, setEditing] = useState(false);

    useEffect(() => {
      if (editing) return;
      setDraft(color ? formatColor(color, format, alpha) : '');
    }, [color, format, alpha, editing]);

    const close = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    useClickOutside([triggerRef, panelRef], close, open);
    useEscapeKey(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, open);

    const emit = useEventCallback((next: RgbaColor | null, complete = false) => {
      const nextFormatted = next ? formatColor(next, format, alpha) : '';
      setCurrentValue(nextFormatted);
      if (complete) onChangeComplete?.(nextFormatted, next);
    });

    const applyPreset = (preset: string) => {
      const parsed = parseColor(preset);
      if (!parsed) return;
      setEditing(false);
      setDraft(formatColor(parsed, format, alpha));
      emit(parsed, true);
    };

    const handleInputChange = (next: string) => {
      setEditing(true);
      setDraft(next);
      const parsed = parseColor(next);
      if (parsed) emit(parsed, false);
    };

    const commitInput = () => {
      if (!editing) return;
      setEditing(false);
      const parsed = parseColor(draft);
      if (!parsed) {
        setDraft(color ? formatColor(color, format, alpha) : '');
        return;
      }
      const nextFormatted = formatColor(parsed, format, alpha);
      setDraft(nextFormatted);
      setCurrentValue(nextFormatted);
      onChangeComplete?.(nextFormatted, parsed);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitInput();
      } else if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const alphaPercent = color ? Math.round(color.a * 100) : 100;
    const alphaLabel = t('colorPicker.alpha', { zh: '透明度', en: 'Alpha' });
    const triggerLabel = t('colorPicker.trigger', { zh: '选择颜色', en: 'Select color' });

    const setAlpha = (percent: number) => {
      if (!color) return;
      const next: RgbaColor = { ...color, a: Math.round(percent) / 100 };
      setEditing(false);
      setDraft(formatColor(next, format, alpha));
      emit(next, false);
    };

    const clear = () => {
      setEditing(false);
      setDraft('');
      emit(null, true);
      setOpen(false);
      triggerRef.current?.focus();
    };

    return (
      <StandaloneField frame={frame} id={triggerId} hidden={rest.hidden} required={field.required}>
        <div
          ref={ref}
          {...rest}
          data-slot="color-picker"
          data-size={resolvedSize}
          data-disabled={disabled || undefined}
          data-open={open || undefined}
          className={cx(SLOT, `${SLOT}--${resolvedSize}`, className, classNames?.root)}
          style={{ ...styles?.root, ...style }}
        >
          {name != null && (
            <input type="hidden" name={name} value={currentValue} disabled={disabled} />
          )}
          <button
            id={triggerId}
            ref={triggerRef}
            type="button"
            data-slot="trigger"
            className={cx(`${SLOT}__trigger`, classNames?.trigger, controlClassName)}
            style={{ ...styles?.trigger, ...controlStyle }}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={
              rest['aria-label'] ?? (frame.hasLabel || field.labelId ? undefined : triggerLabel)
            }
            aria-labelledby={
              rest['aria-labelledby'] ??
              (frame.hasLabel ? (frame.labelProps?.id ?? triggerId + '-label') : field.labelId)
            }
            aria-invalid={frame.invalid || field.ariaProps['aria-invalid'] || rest['aria-invalid']}
            aria-describedby={fieldDescription(
              frame,
              triggerId,
              rest['aria-describedby'],
              field.ariaProps['aria-describedby'],
            )}
            onBlur={field.onBlur}
            onClick={() => {
              if (disabled) return;
              setEditing(false);
              setOpen(!open);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && !open) {
                event.preventDefault();
                setOpen(true);
              }
            }}
          >
            <span
              data-slot="swatch"
              aria-hidden="true"
              className={cx(`${SLOT}__swatch`, classNames?.swatch)}
              style={{
                ...styles?.swatch,
                ...(color ? { backgroundColor: toCssColor(formatted) } : null),
              }}
            />
            <span
              data-slot="value"
              className={cx(
                `${SLOT}__value`,
                !color && `${SLOT}__value--placeholder`,
                classNames?.value,
              )}
              style={styles?.value}
            >
              {color
                ? formatted
                : (placeholder ?? t('colorPicker.placeholder', { zh: '未选择', en: 'No color' }))}
            </span>
            <Icon
              name="chevron-down"
              data-slot="indicator"
              className={cx(`${SLOT}__indicator`, classNames?.indicator)}
              style={styles?.indicator}
            />
          </button>

          <FormItemControlContext.Provider value={null}>
            <Popup
              open={open && !disabled}
              anchorRef={triggerRef}
              placement="bottom-start"
              offset={6}
              role="dialog"
              id={panelId}
              aria-label={triggerLabel}
            >
              <div
                ref={panelRef}
                data-slot="panel"
                className={cx(`${SLOT}__panel`, classNames?.panel)}
                style={styles?.panel}
              >
                <div
                  data-slot="presets"
                  role="group"
                  aria-label={t('colorPicker.presets', { zh: '预设颜色', en: 'Presets' })}
                  className={cx(`${SLOT}__presets`, classNames?.presets)}
                  style={styles?.presets}
                >
                  {presets.map((preset) => {
                    const parsed = parseColor(preset);
                    const presetText = parsed ? formatColor(parsed, format, alpha) : preset;
                    const selected = Boolean(color) && presetText === formatted;
                    return (
                      <button
                        key={preset}
                        type="button"
                        data-slot="preset"
                        data-color={preset}
                        data-selected={selected || undefined}
                        aria-label={preset}
                        aria-pressed={selected}
                        className={cx(
                          `${SLOT}__preset`,
                          selected && `${SLOT}__preset--selected`,
                          classNames?.preset,
                        )}
                        style={{
                          ...styles?.preset,
                          backgroundColor: toCssColor(preset) ?? preset,
                        }}
                        onClick={() => applyPreset(preset)}
                      />
                    );
                  })}
                </div>

                <div
                  data-slot="input-row"
                  className={cx(`${SLOT}__input-row`, classNames?.inputRow)}
                  style={styles?.inputRow}
                >
                  <span
                    data-slot="preview"
                    className={cx(`${SLOT}__preview`, classNames?.preview)}
                    style={{
                      ...styles?.preview,
                      ...(color ? { backgroundColor: toCssColor(formatted) } : null),
                    }}
                  >
                    <input
                      type="color"
                      className="yuki-color-picker__native"
                      aria-label={t('colorPicker.custom', { zh: '自定义颜色', en: 'Custom color' })}
                      value={color ? toHex(color) : '#000000'}
                      onChange={(event) => {
                        const next = parseColor(event.target.value);
                        if (next) emit({ ...next, a: alpha ? (color?.a ?? 1) : 1 }, true);
                      }}
                    />
                  </span>
                  <Input
                    value={draft}
                    onChange={handleInputChange}
                    onBlur={commitInput}
                    onKeyDown={handleInputKeyDown}
                    size={resolvedSize}
                    aria-label={t('colorPicker.input', { zh: '颜色值', en: 'Color value' })}
                    placeholder={placeholder ?? (alpha ? '#rrggbbaa' : '#rrggbb')}
                    className={cx(`${SLOT}__input`, classNames?.input)}
                    style={styles?.input}
                  />
                </div>

                {alpha ? (
                  <div
                    data-slot="alpha"
                    className={cx(`${SLOT}__alpha`, classNames?.alpha)}
                    style={styles?.alpha}
                  >
                    <span className={cx(`${SLOT}__alpha-label`)}>{alphaLabel}</span>
                    <input
                      type="range"
                      data-slot="alpha-input"
                      className={cx(`${SLOT}__alpha-input`, classNames?.alphaInput)}
                      style={styles?.alphaInput}
                      min={0}
                      max={100}
                      step={1}
                      value={alphaPercent}
                      aria-label={alphaLabel}
                      onChange={(event) => setAlpha(Number(event.target.value))}
                      onPointerUp={() => {
                        if (color) emit(color, true);
                      }}
                      onKeyUp={() => {
                        if (color) emit(color, true);
                      }}
                    />
                    <span
                      data-slot="alpha-value"
                      className={cx(`${SLOT}__alpha-value`, classNames?.alphaValue)}
                      style={styles?.alphaValue}
                    >
                      {alphaPercent}%
                    </span>
                  </div>
                ) : null}

                {allowClear ? (
                  <div
                    data-slot="footer"
                    className={cx(`${SLOT}__footer`, classNames?.footer)}
                    style={styles?.footer}
                  >
                    <Button
                      variant="text"
                      size="sm"
                      data-slot="clear"
                      className={cx(`${SLOT}__clear`, classNames?.clear)}
                      style={styles?.clear}
                      onClick={clear}
                    >
                      {t('common.clear', { zh: '清除', en: 'Clear' })}
                    </Button>
                  </div>
                ) : null}
              </div>
            </Popup>
          </FormItemControlContext.Provider>
        </div>
      </StandaloneField>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';

export { DEFAULT_PRESETS as colorPickerPresets };
export type { ColorPickerFormat, RgbaColor };
export { formatColor, isValidColor, parseColor, toCssColor, toHex, toRgb } from './color-utils';
