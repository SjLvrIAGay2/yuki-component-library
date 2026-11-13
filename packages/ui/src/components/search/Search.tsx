import {
  forwardRef,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useMergedRefs } from '../../hooks';
import { useFieldControl } from '../form/context';
import { useComponentDefaults, useComponentSize, useLocale } from '../../theme';
import { Icon } from '../icon/Icon';
import { Input, type InputProps } from '../input/Input';

export interface SearchClassNames {
  root?: string;
  input?: string;
  button?: string;
}

export interface SearchStyles {
  root?: CSSProperties;
  input?: CSSProperties;
  button?: CSSProperties;
}

export interface SearchProps
  extends Omit<
    InputProps,
    'suffix' | 'children' | 'onChange' | 'value' | 'defaultValue'
  > {
  prefix?: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  /** Fired on Enter or on the search button click. */
  onSearch?: (value: string, event?: KeyboardEvent<HTMLInputElement>) => void;
  /** `true` renders the default button; a node replaces its content. */
  enterButton?: boolean | ReactNode;
  loading?: boolean;
  classNames?: SearchClassNames;
  styles?: SearchStyles;
}

/**
 * Search field: an Input with a leading search icon and an optional enter
 * button. Enter always reports through `onSearch`, and the clear affordance is
 * on by default.
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(inputProps, ref) {
  const props = useComponentDefaults('Search', inputProps);
  const {
    value,
    defaultValue,
    onChange,
    onSearch,
    enterButton = false,
    loading = false,
    allowClear = true,
    prefix,
    onKeyDown,
    className,
    classNames,
    styles,
    size: sizeProp,
    status,
    ...rest
  } = props;

  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRefs(ref, inputRef);
  const field = useFieldControl<string>({ disabled: props.disabled });

  const triggerSearch = (event?: KeyboardEvent<HTMLInputElement>) => {
    if (!loading && !field.disabled && inputRef.current) onSearch?.(inputRef.current.value, event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && !event.defaultPrevented) {
      event.preventDefault();
      triggerSearch(event);
    }
  };

  const hasButton = enterButton !== false && enterButton !== undefined;

  return (
    <div
      data-slot="search"
      data-size={size}
      data-status={status ?? 'default'}
      data-loading={loading || undefined}
      className={cx('yuki-search', `yuki-search--${size}`, classNames?.root, className)}
      style={styles?.root}
    >
      <Input
        {...rest}
        ref={mergedRef}
        size={size}
        status={status}
        value={value}
        defaultValue={defaultValue}
        allowClear={allowClear}
        className={cx('yuki-search__input', classNames?.input)}
        style={styles?.input}
        prefix={prefix ?? <Icon name="search" />}
        suffix={
          hasButton ? (
            <button
              type="button"
              data-slot="button"
              disabled={loading || field.disabled}
              aria-busy={loading || undefined}
              aria-label={t('common.search', { zh: '搜索', en: 'Search' })}
              className={cx('yuki-search__button', classNames?.button)}
              style={styles?.button}
              onClick={() => triggerSearch()}
            >
              {typeof enterButton === 'boolean' ? (
                loading ? (
                  <Icon name="refresh" spin />
                ) : (
                  <>
                    <Icon name="search" />
                    <span>{t('common.search', { zh: '搜索', en: 'Search' })}</span>
                  </>
                )
              ) : (
                enterButton
              )}
            </button>
          ) : undefined
        }
        onChange={(next, event) => onChange?.(next, event)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});

Search.displayName = 'Search';
