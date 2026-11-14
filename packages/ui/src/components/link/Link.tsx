import type { StyleProperties, WithStyle } from '../../styles/properties';
import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';

export type LinkUnderline = 'auto' | 'always' | 'hover' | 'none';
export type LinkTone = 'default' | 'subtle' | 'danger';
export type LinkSize = 'sm' | 'md' | 'lg';

export interface LinkClassNames {
  root?: string;
  icon?: string;
}

export interface LinkStyles {
  root?: StyleProperties;
  icon?: StyleProperties;
}

export interface LinkProps
  extends Omit<WithStyle<AnchorHTMLAttributes<HTMLAnchorElement>>, 'color'> {
  underline?: LinkUnderline;
  tone?: LinkTone;
  size?: LinkSize;
  /** Adds an external-link glyph and safe `target`/`rel` defaults. */
  external?: boolean;
  /** Leading decorative icon node. */
  icon?: ReactNode;
  /** Renders a disabled, focusable-but-inert link. */
  disabled?: boolean;
  classNames?: LinkClassNames;
  styles?: LinkStyles;
}

/**
 * Text link. Visually a Typography inline, behaviorally an anchor with safe
 * external defaults and an inert disabled state that keeps keyboard focus.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  inputProps,
  ref,
) {
  const {
    underline = 'auto',
    tone = 'default',
    size,
    external = false,
    icon,
    disabled = false,
    classNames,
    styles,
    className,
    style,
    children,
    target,
    rel,
    onClick,
    ...rest
  } = useComponentDefaults('Link', inputProps);
  const externalTarget = target ?? (external ? '_blank' : undefined);
  const externalRel = external
    ? rel ?? 'noopener noreferrer'
    : rel;

  return (
    <a
      ref={ref}
      {...rest}
      data-slot="link"
      data-underline={underline}
      data-tone={tone}
      data-size={size}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : rest.tabIndex}
      target={externalTarget}
      rel={externalRel}
      className={cx(
        'yuki-link',
        `yuki-link--underline-${underline}`,
        tone !== 'default' && `yuki-link--tone-${tone}`,
        size && `yuki-link--size-${size}`,
        disabled && 'yuki-link--disabled',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {icon && (
        <span
          data-slot="icon"
          className={cx('yuki-link__icon', classNames?.icon)}
          style={styles?.icon}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span data-slot="label" className="yuki-link__label">
        {children}
      </span>
      {external && (
        <Icon
          name="external-link"
          className={cx('yuki-link__external', classNames?.icon)}
          style={styles?.icon}
        />
      )}
    </a>
  );
});

Link.displayName = 'Link';
