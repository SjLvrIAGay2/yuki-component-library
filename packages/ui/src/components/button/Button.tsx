import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useConfig, type Size } from '../../theme';
import { useAnimation, type AnimationOptions } from '../../animation';

export type ButtonVariant =
  'solid' | 'soft' | 'outline' | 'ghost' | 'text' | 'link';
export type ButtonTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type ButtonShape = 'default' | 'round' | 'circle' | 'square';

export interface ButtonClassNames {
  root?: string;
  icon?: string;
  label?: string;
  spinner?: string;
}

export interface ButtonStyles {
  root?: StyleProperties;
  icon?: StyleProperties;
  label?: StyleProperties;
  spinner?: StyleProperties;
}

export interface ButtonProps extends Omit<WithStyle<ButtonHTMLAttributes<HTMLButtonElement>>, 'color'> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  /** Defaults to the ConfigProvider size, then `md`. */
  size?: Size;
  shape?: ButtonShape;
  block?: boolean;
  loading?: boolean;
  /** Copy shown next to the spinner while loading. */
  loadingText?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loadingIndicator?: ReactNode;
  spinnerProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  animation?: AnimationOptions | false;
  /** Icon-only buttons require an accessible name. */
  iconOnly?: boolean;
  classNames?: ButtonClassNames;
  styles?: ButtonStyles;
}

/**
 * The primary action primitive. Six variants × six tones × three sizes, with
 * every visual value expressed through component-scoped tokens.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(inputProps, ref) {
  const {
    variant = 'solid',
    tone = 'primary',
    size: sizeProp,
    shape = 'default',
    block = false,
    loading = false,
    loadingText,
    startIcon,
    endIcon,
    loadingIndicator,
    spinnerProps,
    animation,
    iconOnly = false,
    classNames,
    styles,
    className,
    style,
    children,
    disabled,
    type = 'button',
    ...rest
  } = useComponentDefaults('Button', inputProps);
  const size = useComponentSize(sizeProp);
  const { animation: globalAnimation } = useConfig();
  const { duration: _duration, delay: _delay, ...motion } = useAnimation(animation, 'feedback');
  const customMotion = animation !== undefined || globalAnimation !== undefined;
  const label = loading && loadingText ? loadingText : children;

  return (
    <button
      {...(customMotion ? motion : undefined)}
      ref={ref}
      type={type}
      data-slot="button"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-shape={shape}
      className={cx(
        'yuki-btn',
        customMotion && motion.className,
        `yuki-btn--${variant}`,
        `yuki-btn--${tone}`,
        `yuki-btn--${size}`,
        shape !== 'default' && `yuki-btn--${shape}`,
        block && 'yuki-btn--block',
        loading && 'yuki-btn--loading',
        iconOnly && 'yuki-btn--icon-only',
        classNames?.root,
        className,
      )}
      style={{ ...(customMotion && motion.style), ...styles?.root, ...style }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading &&
        (loadingIndicator !== undefined ? (
          loadingIndicator
        ) : (
          <LoadingSpinner
            {...spinnerProps}
            animation={motion['data-yuki-motion-preset'] === 'none' ? false : animation}
            customMotion={customMotion}
            className={cx(classNames?.spinner, spinnerProps?.className)}
            style={{ ...styles?.spinner, ...spinnerProps?.style }}
          />
        ))}
      {!loading && startIcon != null && (
        <span
          data-slot="icon"
          className={cx('yuki-btn__icon', classNames?.icon)}
          style={styles?.icon}
        >
          {startIcon}
        </span>
      )}
      {label !== undefined && label !== null && label !== '' && (
        <span
          data-slot="label"
          className={cx('yuki-btn__label', classNames?.label)}
          style={styles?.label}
        >
          {label}
        </span>
      )}
      {!loading && endIcon != null && (
        <span
          data-slot="icon"
          className={cx('yuki-btn__icon', classNames?.icon)}
          style={styles?.icon}
        >
          {endIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

function LoadingSpinner({
  animation,
  customMotion,
  className,
  style,
  ...props
}: WithStyle<HTMLAttributes<HTMLSpanElement>> & {
  animation?: AnimationOptions | false;
  customMotion: boolean;
}) {
  const {
    duration: _duration,
    delay: _delay,
    ...spin
  } = useAnimation(animation === false ? false : { ...animation, preset: 'spin' }, 'spin');
  return (
    <span
      {...props}
      {...(customMotion ? spin : undefined)}
      data-slot="spinner"
      className={cx('yuki-btn__spinner', customMotion && spin.className, className)}
      style={{ ...(customMotion && spin.style), ...style }}
      aria-hidden="true"
    />
  );
}

/** Convenience: an icon-only ghost button with a mandatory accessible label. */
export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children' | 'startIcon' | 'endIcon'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = 'ghost', shape = 'square', ...rest },
  ref,
) {
  return <Button ref={ref} iconOnly startIcon={icon} variant={variant} shape={shape} {...rest} />;
});

IconButton.displayName = 'IconButton';
