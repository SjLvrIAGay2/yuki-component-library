import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Icon } from '../icon/Icon';
import { cx } from '../../internal/cx';
import {
  useComponentDefaults,
  useComponentSize,
  useLocale,
  type Size,
} from '../../theme';
import { useControllableState } from '../../hooks';

export type TagVariant = 'soft' | 'solid' | 'outline';
export type TagTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type TagShape = 'default' | 'round';

export interface TagClassNames {
  root?: string;
  icon?: string;
  content?: string;
  close?: string;
}

export interface TagStyles {
  root?: StyleProperties;
  icon?: StyleProperties;
  content?: StyleProperties;
  close?: StyleProperties;
}

export interface TagProps
  extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'onChange'> {
  /** 视觉变体。 */
  variant?: TagVariant;
  /** 语义色。 */
  tone?: TagTone;
  /** 尺寸。 */
  size?: Size;
  /** 形状。 */
  shape?: TagShape;
  /** 前置图标。 */
  icon?: ReactNode;
  /** 是否展示关闭按钮。 */
  closable?: boolean;
  /** 关闭回调，受控场景由父级移除标签。 */
  removeLabel?: string;
  onRemove?: () => void;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 自定义关闭图标。 */
  closeIcon?: ReactNode;
  /** 是否可作为复选框使用。 */
  checkable?: boolean;
  /** 选中态（受控）。 */
  checked?: boolean;
  /** 选中态（非受控）。 */
  defaultChecked?: boolean;
  /** 选中态变化回调。 */
  onCheckedChange?: (checked: boolean) => void;
  /** 禁用标签。 */
  disabled?: boolean;
  classNames?: TagClassNames;
  styles?: TagStyles;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  inputProps,
  ref,
) {
  const {
    variant = 'soft',
    tone = 'neutral',
    size: sizeProp,
    shape = 'default',
    icon,
    onRemove, removeLabel, closable = !!onRemove,
    onClose,
    closeIcon,
    checkable = false,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    classNames,
    styles,
    className,
    style,
    children,
    onClick,
    onKeyDown,
    ...rest
  } = useComponentDefaults('Tag', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const [checked, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const toggle = () => {
    if (!checkable || disabled) return;
    setChecked(!checked);
  };

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) toggle();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (event.target !== event.currentTarget || event.defaultPrevented || !checkable || disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggle();
    }
  };

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClose?.(event);
    if (!event.defaultPrevented) onRemove?.();
  };

  return (
    <span
      ref={ref}
      {...rest}
      data-slot="tag"
      data-size={size}
      data-variant={variant}
      data-tone={tone}
      data-checked={checkable ? checked : undefined}
      data-disabled={disabled || undefined}
      role={checkable ? 'checkbox' : undefined}
      aria-checked={checkable ? checked : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={checkable && !disabled ? 0 : rest.tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cx(
        'yuki-tag',
        `yuki-tag--${size}`,
        `yuki-tag--${variant}`,
        `yuki-tag--${tone}`,
        shape === 'round' && 'yuki-tag--round',
        checkable && 'yuki-tag--checkable',
        checkable && checked && 'yuki-tag--checked',
        disabled && 'yuki-tag--disabled',
        (checkable || closable) && 'yuki-focus-ring',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {icon !== undefined && icon !== null ? (
        <span
          data-slot="icon"
          className={cx('yuki-tag__icon', classNames?.icon)}
          style={styles?.icon}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      {children !== undefined && children !== null ? (
        <span
          data-slot="content"
          className={cx('yuki-tag__content', classNames?.content)}
          style={styles?.content}
        >
          {children}
        </span>
      ) : null}
      {closable ? (
        <button
          type="button"
          data-slot="close"
          className={cx('yuki-tag__close', classNames?.close)}
          style={styles?.close}
          aria-label={removeLabel ?? t('tag.remove', { 'zh-CN': '移除标签', en: 'Remove tag' })}
          disabled={disabled}
          onClick={handleClose}
        >
          {closeIcon ?? <Icon name="x" />}
        </button>
      ) : null}
    </span>
  );
});

Tag.displayName = 'Tag';
