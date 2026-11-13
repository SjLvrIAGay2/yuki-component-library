import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { Popup } from '../../internal/Popup';
import {
  useClickOutside,
  useControllableState,
  useEscapeKey,
} from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

/** A single entry in the suggestion list. */
export interface MentionOption {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
}

/** Predicate deciding which options match the typed keyword. */
export type MentionFilter = (keyword: string, option: MentionOption) => boolean;

export interface MentionsClassNames {
  root?: string;
  textarea?: string;
  dropdown?: string;
  list?: string;
  option?: string;
  optionLabel?: string;
  empty?: string;
  loading?: string;
}

export interface MentionsStyles {
  root?: CSSProperties;
  textarea?: CSSProperties;
  dropdown?: CSSProperties;
  list?: CSSProperties;
  option?: CSSProperties;
  optionLabel?: CSSProperties;
  empty?: CSSProperties;
  loading?: CSSProperties;
}

export interface MentionsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'onSelect'> {
  /** Controlled text value. */
  value?: string;
  defaultValue?: string;
  /** Fired on every text change. */
  onChange?: (value: string) => void;
  /** Fired when an option is inserted. */
  onSelect?: (option: MentionOption, prefix: string) => void;
  /** Static suggestion list. */
  options?: MentionOption[];
  /** Async suggestion source; takes precedence over `options`. */
  loadOptions?: (keyword: string) => MentionOption[] | Promise<MentionOption[]>;
  /** Custom keyword filter for static options. */
  filterOption?: MentionFilter;
  /** Trigger character. */
  prefix?: string;
  /** Text inserted after the selected value. */
  split?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  size?: Size;
  classNames?: MentionsClassNames;
  styles?: MentionsStyles;
}

const SLOT = 'yuki-mentions';
const EMPTY_OPTIONS: MentionOption[] = [];

const defaultFilter: MentionFilter = (keyword, option) => {
  const label = typeof option.label === 'string' ? option.label : option.value;
  return `${option.value} ${label}`.toLowerCase().includes(keyword.toLowerCase());
};

const isWhitespace = (char: string) => /\s/.test(char);

interface MentionTrigger {
  start: number;
  end: number;
  keyword: string;
}

export const Mentions = forwardRef<HTMLDivElement, MentionsProps>(function Mentions(inputProps, ref) {
  const props = useComponentDefaults('Mentions', inputProps);
  const {
    value,
    defaultValue = '',
    onChange,
    onSelect,
    options = EMPTY_OPTIONS,
    loadOptions,
    filterOption = defaultFilter,
    prefix = '@',
    split = ' ',
    placeholder,
    rows = 3,
    maxLength,
    disabled = false,
    size,
    className,
    style,
    classNames,
    styles,
    ...rest
  } = props;

  const { t } = useLocale();
  const resolvedSize = useComponentSize(size);

  const [currentValue, setCurrentValue] = useControllableState<string>({
    value,
    defaultValue,
    onChange,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<MentionTrigger | null>(null);
  const [asyncOptions, setAsyncOptions] = useState<MentionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pendingCaret = useRef<number | null>(null);
  const requestSeq = useRef(0);

  const keyword = trigger?.keyword ?? '';

  const visibleOptions = useMemo(() => {
    if (loadOptions) return asyncOptions;
    if (!keyword) return options;
    return options.filter((option) => filterOption(keyword, option));
  }, [loadOptions, asyncOptions, options, keyword, filterOption]);

  useEffect(() => {
    const firstEnabled = visibleOptions.findIndex((option) => !option.disabled);
    setActiveIndex(firstEnabled < 0 ? 0 : firstEnabled);
  }, [visibleOptions]);

  useEffect(() => {
    if (!open || !loadOptions) return;
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    let cancelled = false;
    setLoading(true);
    Promise.resolve(loadOptions(keyword))
      .then((result) => {
        if (cancelled || seq !== requestSeq.current) return;
        setAsyncOptions(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled || seq !== requestSeq.current) return;
        setAsyncOptions([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, keyword, loadOptions]);

  useEffect(() => {
    const element = textareaRef.current;
    const caret = pendingCaret.current;
    if (!element || caret === null) return;
    pendingCaret.current = null;
    element.focus();
    element.setSelectionRange(caret, caret);
  }, [currentValue]);

  const close = useCallback(() => {
    setOpen(false);
    setTrigger(null);
  }, []);

  useClickOutside([textareaRef, listRef], close, open);
  useEscapeKey(close, open);

  const syncTrigger = useCallback(
    (nextValue: string, caret: number | null) => {
      if (disabled) {
        setOpen(false);
        setTrigger(null);
        return;
      }
      const element = textareaRef.current;
      const position = caret ?? element?.selectionStart ?? nextValue.length;
      const before = nextValue.slice(0, position);
      const start = before.lastIndexOf(prefix);
      if (start < 0) {
        setOpen(false);
        setTrigger(null);
        return;
      }
      const charBefore = start > 0 ? before.charAt(start - 1) : '';
      if (charBefore && !isWhitespace(charBefore)) {
        setOpen(false);
        setTrigger(null);
        return;
      }
      const nextKeyword = before.slice(start + prefix.length);
      if (nextKeyword.includes(prefix) || /\s/.test(nextKeyword)) {
        setOpen(false);
        setTrigger(null);
        return;
      }
      setTrigger({ start, end: position, keyword: nextKeyword });
      setOpen(true);
    },
    [disabled, prefix],
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setCurrentValue(nextValue);
    syncTrigger(nextValue, event.target.selectionStart);
  };

  const optionId = (index: number) => `${baseId}-option-${index}`;

  const selectOption = (option: MentionOption) => {
    if (!trigger || option.disabled || disabled) return;
    const before = currentValue.slice(0, trigger.start);
    const after = currentValue.slice(trigger.end);
    const insertion = `${prefix}${option.value}${split}`;
    pendingCaret.current = trigger.start + insertion.length;
    setCurrentValue(`${before}${insertion}${after}`);
    onSelect?.(option, prefix);
    setOpen(false);
    setTrigger(null);
  };

  const moveActive = (delta: number) => {
    if (visibleOptions.length === 0) return;
    let index = activeIndex;
    for (let step = 0; step < visibleOptions.length; step += 1) {
      index = (index + delta + visibleOptions.length) % visibleOptions.length;
      const candidate = visibleOptions[index];
      if (candidate && !candidate.disabled) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      const option = visibleOptions[activeIndex];
      if (option && !option.disabled) {
        event.preventDefault();
        selectOption(option);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  const activeOption = visibleOptions[activeIndex];

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="mentions"
      data-size={resolvedSize}
      data-disabled={disabled || undefined}
      data-open={open || undefined}
      className={cx(SLOT, `${SLOT}--${resolvedSize}`, className, classNames?.root)}
      style={{ ...styles?.root, ...style }}
    >
      <textarea
        ref={textareaRef}
        data-slot="textarea"
        className={cx(`${SLOT}__textarea`, classNames?.textarea)}
        style={styles?.textarea}
        rows={rows}
        value={currentValue}
        placeholder={
          placeholder ??
          t('mentions.placeholder', { zh: '输入 @ 提及他人', en: 'Type @ to mention someone' })
        }
        maxLength={maxLength}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeOption && !activeOption.disabled ? optionId(activeIndex) : undefined
        }
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          if (
            event.key.startsWith('Arrow') ||
            event.key === 'Home' ||
            event.key === 'End'
          ) {
            syncTrigger(currentValue, event.currentTarget.selectionStart);
          }
        }}
        onClick={() => syncTrigger(currentValue, textareaRef.current?.selectionStart ?? null)}
      />

      <Popup open={open} anchorRef={textareaRef} placement="bottom-start" offset={4}>
        <div
          data-slot="dropdown"
          className={cx(`${SLOT}__dropdown`, classNames?.dropdown)}
          style={styles?.dropdown}
        >
          <ul
            ref={listRef}
            data-slot="list"
            role="listbox"
            id={listboxId}
            aria-label={t('mentions.suggestions', {
              zh: '提及建议',
              en: 'Mention suggestions',
            })}
            className={cx(`${SLOT}__list`, 'yuki-scrollbar', classNames?.list)}
            style={styles?.list}
          >
            {loading ? (
              <li
                data-slot="loading"
                role="presentation"
                className={cx(`${SLOT}__loading`, classNames?.loading)}
                style={styles?.loading}
              >
                {t('common.loading', { zh: '加载中…', en: 'Loading…' })}
              </li>
            ) : null}
            {!loading && visibleOptions.length === 0 ? (
              <li
                data-slot="empty"
                role="presentation"
                className={cx(`${SLOT}__empty`, classNames?.empty)}
                style={styles?.empty}
              >
                {t('common.noData')}
              </li>
            ) : null}
            {!loading
              ? visibleOptions.map((option, index) => {
                  const active = index === activeIndex;
                  return (
                    <li
                      key={option.value}
                      id={optionId(index)}
                      role="option"
                      data-slot="option"
                      data-active={active || undefined}
                      data-disabled={option.disabled || undefined}
                      aria-selected={active}
                      aria-disabled={option.disabled || undefined}
                      className={cx(
                        `${SLOT}__option`,
                        active && `${SLOT}__option--active`,
                        option.disabled && `${SLOT}__option--disabled`,
                        classNames?.option,
                      )}
                      style={styles?.option}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => {
                        if (!option.disabled) setActiveIndex(index);
                      }}
                      onClick={() => selectOption(option)}
                    >
                      <span
                        data-slot="option-label"
                        className={cx(`${SLOT}__option-label`, classNames?.optionLabel)}
                        style={styles?.optionLabel}
                      >
                        {option.label ?? option.value}
                      </span>
                    </li>
                  );
                })
              : null}
          </ul>
        </div>
      </Popup>
    </div>
  );
});

Mentions.displayName = 'Mentions';
