import { useAnimation, usePresence, type AnimationOptions } from '../../animation';
import { inertValue } from '../../internal/inert';
import {
  StandaloneField,
  useStandaloneField,
  fieldDescription,
  type StandaloneFieldProps,
} from '../form/StandaloneField';
import { useFieldControl } from '../form/context';
import { mergeProps } from '../../internal/merge-props';
import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cx } from '../../internal/cx';
import { createTypeahead, isPrintableKey } from '../../internal/keyboard';
import { Popup } from '../../internal/Popup';
import {
  useClickOutside,
  useControllableState,
  useEscapeKey,
  useEventCallback,
  useMergedRefs,
} from '../../hooks';
import type { Placement } from '../../hooks';
import { useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon';
import {
  buildSelectRows,
  defaultFilterOption,
  filterSelectItems,
  findEnabledIndex,
  findTypeaheadIndex,
  firstEnabledIndex,
  lastEnabledIndex,
  optionLabelText,
  type SelectOption,
  type SelectOptionInput,
  type SelectRow,
  type SelectStatus,
} from './select-utils';
import { SelectPanelStatus, SelectTrigger, getListboxId, getOptionId } from './select-shared';
import { SelectTags, type SelectTagOptions } from './select-tags';

export interface SelectClassNames {
  root?: string;
  trigger?: string;
  value?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  clear?: string;
  arrow?: string;
  panel?: string;
  search?: string;
  list?: string;
  option?: string;
  optionLabel?: string;
  optionDescription?: string;
  optionCheck?: string;
  group?: string;
  tags?: string;
  tag?: string;
  tagLabel?: string;
  tagRemove?: string;
  more?: string;
  empty?: string;
  loading?: string;
}

export interface SelectStyles {
  root?: CSSProperties;
  tags?: CSSProperties;
  trigger?: CSSProperties;
  panel?: CSSProperties;
  list?: CSSProperties;
  option?: CSSProperties;
  search?: CSSProperties;
}

export interface SelectOptionRenderState {
  selected: boolean;
  active: boolean;
  disabled: boolean;
}

interface CommonSelectProps<T>
  extends
    StandaloneFieldProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'value' | 'prefix'> {
  /** Flat or grouped options. */
  options: readonly SelectOptionInput<T>[];
  onClear?: () => void;
  /** Controlled open state for the panel. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: Size;
  placeholder?: ReactNode;
  disabled?: boolean;
  /** Focusable but not editable; the panel never opens. */
  readOnly?: boolean;
  invalid?: boolean;
  status?: SelectStatus;
  clearable?: boolean;
  /** Show a filter input inside the panel. */
  searchable?: boolean;
  filterOption?: (query: string, option: SelectOption<T>) => boolean;
  /** Called whenever the filter query changes. */
  onSearch?: (query: string) => void;
  /** Placeholder for the panel filter input. */
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  loading?: boolean;
  loadingText?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  showArrow?: boolean;
  borderless?: boolean;
  placement?: Placement;
  /** Expand the panel to fit option labels, capped to the viewport. Defaults to trigger width. */
  popupWidth?: 'trigger' | 'content';
  /** Mount the popup inside a fullscreen element or another local overlay host. */
  portalContainer?: HTMLElement | null;
  forceMount?: boolean;
  animation?: AnimationOptions | false;
  triggerProps?: HTMLAttributes<HTMLDivElement>;
  contentProps?: HTMLAttributes<HTMLDivElement>;
  viewportProps?: HTMLAttributes<HTMLUListElement>;
  valueProps?: HTMLAttributes<HTMLSpanElement>;
  optionProps?: (option: SelectOption<T>, index: number) => HTMLAttributes<HTMLLIElement>;
  icon?: ReactNode;
  indicator?: ReactNode;
  /** Custom option renderer; receives the resolved state. */
  renderOption?: (option: SelectOption<T>, state: SelectOptionRenderState) => ReactNode;
  /** Renders a hidden input for native form submission. */
  name?: string;
  required?: boolean;
  classNames?: SelectClassNames;
  styles?: SelectStyles;
}

export type SingleSelectProps<T = string> = CommonSelectProps<T> &
  { [K in keyof SelectTagOptions<T>]?: never } & {
    multiple?: false;
    value?: T | null;
    defaultValue?: T | null;
    onChange?: (value: NoInfer<T> | null, option: SelectOption<NoInfer<T>> | null) => void;
    renderValue?: (option: SelectOption<T>) => ReactNode;
  };

export interface MultipleSelectProps<T = string> extends CommonSelectProps<T>, SelectTagOptions<T> {
  multiple: true;
  value?: readonly T[] | null;
  defaultValue?: readonly T[];
  onChange?: (values: NoInfer<T>[], options: SelectOption<NoInfer<T>>[]) => void;
  renderValue?: never;
}

export type SelectProps<T = string> = SingleSelectProps<T> | MultipleSelectProps<T>;

const EMPTY_VALUES: readonly never[] = [];

function SelectInner<T>(inputProps: SelectProps<T>, forwardedRef: Ref<HTMLDivElement>) {
  const { multiple, onChange, ...props } = useComponentDefaults('Select', inputProps);
  const { control, frame, controlStyle, controlClassName } = useStandaloneField(props);
  const {
    options,
    value: valueProp,
    defaultValue,
    renderTag,
    removable = true,
    removeLabel,
    maxTagCount,
    maxTagPlaceholder,
    onRemove,
    onClear,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    size: sizeProp,
    placeholder,
    disabled: disabledProp = false,
    readOnly = false,
    invalid: invalidProp = false,
    status: statusProp,
    clearable = false,
    searchable = false,
    filterOption,
    onSearch,
    searchPlaceholder,
    emptyText,
    loading = false,
    loadingText,
    prefix,
    suffix,
    showArrow = true,
    borderless = false,
    popupWidth = 'trigger',
    placement = popupWidth === 'content' ? 'bottom-start' : 'bottom',
    portalContainer,
    forceMount,
    animation,
    triggerProps,
    contentProps: panelProps = {},
    viewportProps,
    valueProps,
    optionProps,
    icon,
    indicator,
    renderOption,
    renderValue,
    name,
    required: requiredProp = false,
    classNames,
    styles,
    className,
    style,
    id,
    onKeyDown,
    ...rest
  } = control;
  const field = useFieldControl<T | readonly T[] | null>({
    id,
    value: valueProp,
    status: statusProp,
    disabled: disabledProp,
  });
  const disabled = field.disabled;
  const required = requiredProp || field.required;
  const invalid = invalidProp || frame.invalid || field.status === 'error';
  const status = frame.invalid ? 'error' : field.status === 'default' ? undefined : field.status;
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeahead = useMemo(() => createTypeahead(), []);
  const mergedRootRef = useMergedRefs(rootRef, forwardedRef);

  const triggerAttrs = mergeProps(rest, triggerProps ?? {});
  const interactive = !disabled && !readOnly && !triggerAttrs.hidden && !frame.fieldProps?.hidden;
  const [requestedOpen, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const open = requestedOpen && interactive;
  const { duration, delay, ...motion } = useAnimation(animation, 'scale');
  const present = usePresence(
    open,
    animation === undefined ? 0 : duration,
    animation === undefined ? 0 : delay,
  );
  const all = useMemo(() => buildSelectRows(options), [options]);
  const findOption = (value: T) => all.options.find((option) => Object.is(option.value, value));
  // A saved selection can outlive a page of remotely loaded options.
  const resolveOption = (value: T): SelectOption<T> =>
    findOption(value) ?? { value, label: String(value) };
  const boundValue = field.bound ? (field.value ?? null) : valueProp;
  const asValues = (value: typeof boundValue): readonly T[] => {
    if (multiple) return Array.isArray(value) ? value : EMPTY_VALUES;
    // In single mode an array may itself be an option value.
    return value == null ? EMPTY_VALUES : [value as T];
  };
  const [selection, setValues] = useControllableState<readonly T[]>({
    value: boundValue === undefined ? undefined : asValues(boundValue),
    defaultValue: () => asValues(defaultValue),
    onChange: (next) => {
      if (multiple) {
        const selected = [...next];
        onChange?.(selected, selected.map(resolveOption));
        field.onChange?.(selected);
      } else {
        const selected = next[0] ?? null;
        onChange?.(selected, selected === null ? null : findOption(selected) ?? null);
        field.onChange?.(selected);
      }
    },
  });
  const values = multiple ? selection : selection.slice(0, 1);
  const isSelected = (value: T) => values.some((current) => Object.is(current, value));
  const [requestedIndex, setActiveIndex] = useState(-1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return all;
    return buildSelectRows(filterSelectItems(options, (option) =>
      (filterOption ?? defaultFilterOption)(search, option),
    ));
  }, [options, all, search, filterOption]);

  const listOptions = filtered.options;
  const preferredIndex = (items: readonly SelectOption<T>[], fallback: 'first' | 'last' = 'first') => {
    const selectedIndex = items.findIndex((option) => !option.disabled && isSelected(option.value));
    if (selectedIndex >= 0) return selectedIndex;
    return fallback === 'last' ? lastEnabledIndex(items) : firstEnabledIndex(items);
  };
  const requestedOption = listOptions[requestedIndex];
  const activeIndex = requestedOption && !requestedOption.disabled
    ? requestedIndex
    : search ? firstEnabledIndex(listOptions) : preferredIndex(listOptions);
  const triggerId = field.id ?? triggerProps?.id ?? `${baseId}-trigger`;
  const listboxId = getListboxId(baseId);

  const focusTrigger = useCallback(() => {
    triggerRef.current?.focus();
  }, []);

  const close = useEventCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) focusTrigger();
  });

  const openWith = useEventCallback((fallback: 'first' | 'last' = 'first') => {
    if (!interactive) return;
    setSearch('');
    setActiveIndex(preferredIndex(all.options, fallback));
    setOpen(true);
  });

  const removeValue = (value: T) => {
    setValues(values.filter((item) => !Object.is(item, value)));
    onRemove?.(value);
  };

  const commit = useEventCallback((option: SelectOption<T>) => {
    if (!interactive || loading || option.disabled) return;
    if (multiple) {
      if (isSelected(option.value)) removeValue(option.value);
      else setValues([...values, option.value]);
    } else {
      if (!isSelected(option.value)) setValues([option.value]);
      close(true);
    }
  });

  const clearSelection = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (disabled || readOnly) return;
    setValues(EMPTY_VALUES);
    onClear?.();
    close(true);
  };

  const moveActive = useEventCallback((delta: 1 | -1, boundary?: 'first' | 'last') => {
    if (loading || listOptions.length === 0) return;
    if (boundary === 'first') setActiveIndex(firstEnabledIndex(listOptions));
    else if (boundary === 'last') setActiveIndex(lastEnabledIndex(listOptions));
    else setActiveIndex(findEnabledIndex(listOptions, activeIndex, delta));
  });

  const selectActive = useEventCallback(() => {
    if (loading) return;
    const option = listOptions[activeIndex];
    if (option) commit(option);
  });

  const typeaheadSelect = useEventCallback((query: string) => {
    if (loading) return;
    const index = findTypeaheadIndex(all.options, query, -1);
    const option = all.options[index];
    if (!option) return;
    if (multiple) {
      setSearch('');
      setActiveIndex(index);
      setOpen(true);
    } else {
      commit(option);
    }
  });

  const typeaheadMove = useEventCallback((query: string) => {
    if (query.length === 0) return;
    const index = findTypeaheadIndex(listOptions, query, activeIndex);
    if (index >= 0) setActiveIndex(index);
  });

  const handleOpenKeyDown = (event: KeyboardEvent<HTMLElement>, editingSearch: boolean) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        moveActive(event.key === 'ArrowDown' ? 1 : -1);
        break;
      case 'Home':
      case 'End':
        event.preventDefault();
        moveActive(1, event.key === 'Home' ? 'first' : 'last');
        break;
      case ' ':
      case 'Enter':
        if (event.key === ' ' && editingSearch) return;
        event.preventDefault();
        selectActive();
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
      case 'Tab':
        // Resume the normal tab order at the trigger before unmounting the portal.
        close(editingSearch);
        break;
      default:
        if (!editingSearch && isPrintableKey(event)) {
          event.preventDefault();
          typeaheadMove(typeahead.push(event.key));
        }
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || event.nativeEvent.isComposing) return;
    // A custom tag may own its own keyboard-operable remove button.
    if (event.target !== event.currentTarget) return;
    if (open) {
      handleOpenKeyDown(event, false);
    } else if (['ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openWith(event.key === 'ArrowUp' ? 'last' : 'first');
    } else if (event.key === 'Backspace' && multiple && removable && values.length) {
      event.preventDefault();
      removeValue(values[values.length - 1]!);
    } else if (event.key === 'Delete' && clearable && values.length) {
      event.preventDefault();
      setValues(EMPTY_VALUES);
      onClear?.();
    } else if (isPrintableKey(event)) {
      event.preventDefault();
      typeaheadSelect(typeahead.push(event.key));
    }
  };

  const handleTriggerClick = () => {
    if (!interactive) return;
    if (open) {
      if (searchable) {
        searchRef.current?.focus();
        return;
      }
      close(false);
      return;
    }
    openWith();
  };

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // Close an active panel when its field becomes unavailable.
  useEffect(() => {
    if (!interactive && requestedOpen) setOpen(false);
  }, [interactive, requestedOpen, setOpen]);

  const handleSearchChange = (next: string) => {
    setSearch(next);
    onSearch?.(next);
    // Use the first enabled row from the next filter result.
    setActiveIndex(-1);
  };

  useClickOutside([rootRef, panelRef], () => setOpen(false), open);
  useEscapeKey(() => {
    setOpen(false);
    focusTrigger();
  }, open);

  // Reveal the active option.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = document.getElementById(getOptionId(baseId, activeIndex));
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, baseId]);

  const renderRow = (row: SelectRow<T>) => {
    if (row.type === 'group') {
      return (
        <li
          key={row.key}
          role="presentation"
          data-slot="group"
          className={cx('yuki-select-group', classNames?.group)}
        >
          {row.label}
        </li>
      );
    }
    const { option, index } = row;
    const selected = isSelected(option.value);
    const isActive = index === activeIndex;
    const optionState: SelectOptionRenderState = {
      selected,
      active: isActive,
      disabled: Boolean(option.disabled),
    };
    const itemProps = optionProps?.(option, index);
    return (
      <li
        {...itemProps}
        key={row.key}
        id={getOptionId(baseId, index)}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        data-slot="option"
        data-active={isActive ? '' : undefined}
        data-selected={selected ? '' : undefined}
        data-disabled={option.disabled ? '' : undefined}
        className={cx(
          'yuki-select-option',
          isActive && 'yuki-select-option--active',
          selected && 'yuki-select-option--selected',
          option.disabled && 'yuki-select-option--disabled',
          classNames?.option,
          itemProps?.className,
        )}
        style={{ ...styles?.option, ...itemProps?.style }}
        onMouseEnter={(event) => {
          itemProps?.onMouseEnter?.(event);
          if (!event.defaultPrevented && !option.disabled) setActiveIndex(index);
        }}
        onMouseDown={(event) => {
          itemProps?.onMouseDown?.(event);
          event.preventDefault();
        }}
        onClick={(event) => {
          itemProps?.onClick?.(event);
          if (!event.defaultPrevented) commit(option);
        }}
      >
        {renderOption ? (
          renderOption(option, optionState)
        ) : (
          <>
            <span data-slot="option-content" className="yuki-select-option__content">
              <span
                data-slot="option-label"
                className={cx('yuki-select-option__label', classNames?.optionLabel)}
              >
                {option.label}
              </span>
              {option.description != null && (
                <span
                  data-slot="option-description"
                  className={cx('yuki-select-option__description', classNames?.optionDescription)}
                >
                  {option.description}
                </span>
              )}
            </span>
            {selected && (
              <span
                data-slot="option-check"
                aria-hidden="true"
                className={cx('yuki-select-option__check', classNames?.optionCheck)}
              >
                {indicator === undefined ? <Icon name="check" size="1em" /> : indicator}
              </span>
            )}
          </>
        )}
      </li>
    );
  };

  let panelContent: ReactNode;
  if (loading) {
    panelContent = (
      <SelectPanelStatus className={classNames?.loading}>
        <span className="yuki-select-status__loading">
          <Icon name="loader" spin size="1em" />
        </span>{' '}
        {loadingText ?? t('common.loading', { zh: '加载中…', en: 'Loading…' })}
      </SelectPanelStatus>
    );
  } else if (listOptions.length === 0) {
    panelContent = (
      <SelectPanelStatus className={classNames?.empty}>
        {emptyText ?? t('common.noData', { zh: '暂无数据', en: 'No data' })}
      </SelectPanelStatus>
    );
  } else {
    panelContent = (
      <ul
        {...viewportProps}
        id={listboxId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        aria-label={t('select.options', { zh: '选项', en: 'Options' })}
        data-slot="list"
        className={cx('yuki-select-list', classNames?.list, viewportProps?.className)}
        style={{ ...styles?.list, ...viewportProps?.style }}
      >
        {filtered.rows.map(renderRow)}
      </ul>
    );
  }

  const controlledList = open && !loading && listOptions.length > 0 ? listboxId : undefined;
  const listboxActiveId = controlledList && activeIndex >= 0
    ? getOptionId(baseId, activeIndex) : undefined;
  const hasValue = values.length > 0;
  const selectedOption = hasValue && !multiple ? findOption(values[0]!) : undefined;
  const selectedOptions = multiple ? values.map(resolveOption) : [];
  const valueText = selectedOption ? optionLabelText(selectedOption) : hasValue ? String(values[0]) : undefined;
  const triggerValue = selectedOption ? (renderValue?.(selectedOption) ?? selectedOption.label) : valueText;

  return (
    <StandaloneField
      frame={frame}
      id={triggerId}
      hidden={triggerAttrs.hidden}
      required={required}
      focusControl={focusTrigger}
    >
      <div
        ref={mergedRootRef}
        data-slot="select"
        data-multiple={multiple || undefined}
        data-size={size}
        data-open={open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-invalid={invalid || status === 'error' ? '' : undefined}
        data-status={status}
        data-value={multiple ? selectedOptions.map(optionLabelText).join(',') || undefined : valueText}
        className={cx(
          'yuki-select-root',
          multiple ? 'yuki-multi-select' : 'yuki-select',
          className,
          classNames?.root,
        )}
        style={{ ...style, ...styles?.root }}
      >
        {name != null && (multiple ? values : [values[0] ?? '']).map((item, index) => (
          <input
            key={index}
            type="hidden"
            name={name}
            value={String(item)}
            disabled={disabled}
            required={required}
          />
        ))}
        <SelectTrigger
          {...triggerAttrs}
          {...field.ariaProps}
          ref={triggerRef}
          id={triggerId}
          role="combobox"
          open={open}
          size={size}
          disabled={disabled}
          invalid={invalid}
          status={status}
          borderless={borderless}
          placeholder={placeholder ?? t('select.placeholder', { zh: '请选择', en: 'Select' })}
          value={triggerValue}
          valueProps={valueProps}
          arrowIcon={icon}
          multiple={multiple}
          hasValue={hasValue}
          prefix={prefix}
          suffix={suffix}
          showArrow={showArrow}
          clearable={clearable && !readOnly}
          onClear={clearSelection}
          clearLabel={t('common.clear', { zh: '清除', en: 'Clear' })}
          aria-invalid={invalid || triggerAttrs['aria-invalid']}
          aria-labelledby={
            triggerAttrs['aria-labelledby'] ??
            (frame.hasLabel ? (frame.labelProps?.id ?? triggerId + '-label') : field.labelId)
          }
          aria-describedby={fieldDescription(
            frame,
            triggerId,
            triggerAttrs['aria-describedby'],
            field.ariaProps['aria-describedby'],
          )}
          aria-haspopup="listbox"
          aria-controls={controlledList}
          aria-activedescendant={listboxActiveId}
          aria-required={required || undefined}
          aria-readonly={readOnly || undefined}
          className={cx(classNames?.trigger, controlClassName, triggerAttrs.className)}
          classNames={{
            value: classNames?.value,
            placeholder: classNames?.placeholder,
            prefix: classNames?.prefix,
            suffix: classNames?.suffix,
            clear: classNames?.clear,
            arrow: classNames?.arrow,
          }}
          style={{ ...styles?.trigger, ...controlStyle, ...triggerAttrs.style }}
          onClick={(event) => {
            triggerAttrs.onClick?.(event);
            if (!event.defaultPrevented) handleTriggerClick();
          }}
          onBlur={(event) => {
            triggerAttrs.onBlur?.(event);
            field.onBlur?.();
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            triggerProps?.onKeyDown?.(event);
            if (!event.defaultPrevented) onTriggerKeyDown(event);
          }}
        >
          {multiple && hasValue ? (
            <SelectTags
              options={selectedOptions}
              remove={removable && interactive ? removeValue : undefined}
              renderTag={renderTag}
              removeLabel={removeLabel}
              maxTagCount={maxTagCount}
              maxTagPlaceholder={maxTagPlaceholder}
              classNames={classNames}
              valueProps={valueProps}
              style={styles?.tags}
            />
          ) : null}
        </SelectTrigger>
        <Popup
          open={open || (animation !== undefined && !forceMount && present)}
          data-state={open ? 'open' : 'closed'}
          surfaceProps={{
            ...(animation === undefined ? {} : motion),
            'aria-hidden': open ? undefined : true,
            inert: inertValue(!open),
          }}
          container={portalContainer}
          forceMount={forceMount}
          anchorRef={triggerRef}
          placement={placement}
          matchAnchorWidth={popupWidth === 'content' ? 'minimum' : true}
          className={popupWidth === 'content' ? 'yuki-select-popup--content' : undefined}
          role={searchable ? 'dialog' : undefined}
          aria-label={
            searchable ? t('select.search', { zh: '筛选选项', en: 'Filter options' }) : undefined
          }
        >
          <div
            {...panelProps}
            ref={panelRef}
            data-slot="panel"
            className={cx('yuki-select-panel', classNames?.panel, panelProps.className)}
            style={{ ...styles?.panel, ...panelProps.style }}
          >
            {searchable && (
              <div
                data-slot="search"
                className={cx('yuki-select-search', classNames?.search)}
                style={styles?.search}
              >
                <span className="yuki-select-search__icon" aria-hidden="true">
                  <Icon name="search" size="1em" />
                </span>
                <input
                  ref={searchRef}
                  data-slot="search-input"
                  className="yuki-select-search__input"
                  type="text"
                  value={search}
                  placeholder={
                    searchPlaceholder ??
                    t('select.searchPlaceholder', { zh: '搜索…', en: 'Search…' })
                  }
                  aria-label={t('select.search', { zh: '筛选选项', en: 'Filter options' })}
                  aria-autocomplete="list"
                  aria-controls={controlledList}
                  aria-activedescendant={listboxActiveId}
                  autoComplete="off"
                  autoFocus={open}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (!event.nativeEvent.isComposing) handleOpenKeyDown(event, true);
                  }}
                />
              </div>
            )}
            {panelContent}
          </div>
        </Popup>
      </div>
    </StandaloneField>
  );
}

/**
 * A searchable listbox. Single selection commits and closes the panel;
 * multiple selection toggles tags and keeps the panel open.
 */
export const Select = forwardRef(SelectInner) as <T = string>(
  props: SelectProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;

(Select as { displayName?: string }).displayName = 'Select';

export default Select;
