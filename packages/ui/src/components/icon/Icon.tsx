import { useComponentDefaults } from '../../theme';
import { forwardRef, type ReactNode, type SVGProps } from 'react';
import { cx } from '../../internal/cx';
import { iconNodes, type IconName } from './icons';

export type { IconName };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children'> {
  /** Built-in icon name. Omit when passing custom children. */
  name?: IconName;
  /** Token-friendly shorthand: number = px, string = any CSS length. */
  size?: number | string;
  /** Accessible name. Omit for purely decorative icons. */
  label?: string;
  /** Rotate the icon continuously (e.g. a custom spinner). */
  spin?: boolean;
  /** Custom SVG contents, overriding `name`. */
  children?: ReactNode;
}

/**
 * The single icon primitive used across the library. 1.75 stroke, 24x24 box,
 * inherits `currentColor`, decorated with `aria-hidden` unless `label` is set.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  inputProps,
  ref,
) {
  const {
    name,
    size,
    label,
    spin = false,
    className,
    style,
    children,
    strokeWidth = 1.75,
    ...rest
  } = useComponentDefaults('Icon', inputProps);
  const resolvedSize = typeof size === 'string' && /^(2xs|xs|sm|md|lg|xl|2xl|3xl)$/.test(size)
    ? `var(--yuki-icon-size-${size})` : size;
  const content = children ?? (name ? iconNodes[name] : null);
  const named = Boolean(label ?? rest['aria-label'] ?? rest['aria-labelledby']);
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={cx('yuki-icon', spin && 'yuki-icon--spin', className)}
      style={
        { width: rest.width ?? resolvedSize, height: rest.height ?? resolvedSize, ...style }
      }
      role={named ? 'img' : undefined}
      aria-label={label}
      aria-hidden={named ? undefined : true}
      {...rest}
    >
      {content}
    </svg>
  );
});

Icon.displayName = 'Icon';
