import type { StyleProperties, WithStyle } from '../../styles/properties';
import { Fragment, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useLocale } from '../../theme';
import type { SelectClassNames } from './Select';
import { SelectTag } from './select-shared';
import { optionLabelText, type SelectOption } from './select-utils';

export interface SelectTagOptions<T> {
  onRemove?: (value: T) => void;
  removable?: boolean;
  removeLabel?: (option: SelectOption<T>) => string;
  renderTag?: (option: SelectOption<T>, remove: (() => void) | undefined) => ReactNode;
  maxTagCount?: number;
  maxTagPlaceholder?: (hiddenOptions: SelectOption<T>[]) => ReactNode;
}

interface TagsProps<T> extends Omit<SelectTagOptions<T>, 'onRemove' | 'removable'> {
  options: SelectOption<T>[];
  remove?: (value: T) => void;
  classNames?: SelectClassNames;
  valueProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  style?: StyleProperties;
}

export function SelectTags<T>({
  options, remove, removeLabel, renderTag, maxTagCount, maxTagPlaceholder,
  classNames, style, valueProps,
}: TagsProps<T>) {
  const { t } = useLocale();
  const limit = maxTagCount != null && maxTagCount >= 0 ? maxTagCount : options.length;
  const hidden = options.slice(limit);
  return (
    <span
      {...valueProps}
      data-slot="tags"
      className={cx(
        'yuki-select-trigger__value',
        'yuki-multi-select__tags',
        classNames?.tags,
        classNames?.value,
        valueProps?.className,
      )}
      style={{ ...style, ...valueProps?.style }}
    >
      {options.slice(0, limit).map((option, index) => {
        const dismiss = remove ? () => remove(option.value) : undefined;
        const text = optionLabelText(option);
        const key = typeof option.value === 'string' || typeof option.value === 'number'
          ? `${typeof option.value}:${option.value}` : index;
        return renderTag ? (
          <Fragment key={key}>{renderTag(option, dismiss)}</Fragment>
        ) : (
          <SelectTag
            key={key}
            label={option.label}
            removeLabel={
              removeLabel?.(option) ?? `${t('select.remove', { zh: '移除', en: 'Remove' })} ${text}`
            }
            onRemove={dismiss}
            classNames={classNames}
          />
        );
      })}
      {hidden.length > 0 && (
        <span data-slot="more" className={cx('yuki-multi-select__more', classNames?.more)}>
          {maxTagPlaceholder ? maxTagPlaceholder(hidden) : `+${hidden.length}`}
        </span>
      )}
    </span>
  );
}
