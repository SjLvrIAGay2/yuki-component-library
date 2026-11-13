import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerLabelPosition = 'start' | 'center' | 'end';

export interface DividerClassNames {
  root?: string;
  label?: string;
}

export interface DividerStyles {
  root?: CSSProperties;
  label?: CSSProperties;
}

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** A decorative rule has no separator semantics. */
  decorative?: boolean;
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  labelPosition?: DividerLabelPosition;
  /** Slightly stronger line for section-level separation. */
  strong?: boolean;
  classNames?: DividerClassNames;
  styles?: DividerStyles;
  children?: ReactNode;
}

/**
 * A hairline separator. Horizontal dividers may carry a short label; vertical
 * dividers stretch to the height of their flex parent.
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  inputProps,
  ref,
) {
  const {
    decorative = false,
    orientation = 'horizontal',
    variant = 'solid',
    labelPosition = 'center',
    strong = false,
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = useComponentDefaults('Divider', inputProps);
  const role = decorative ? 'presentation' : rest.role ?? 'separator';
  const hasLabel = children !== undefined && children !== null && children !== false;

  return (
    <div
      ref={ref}
      {...rest}
      role={role}
      aria-orientation={role === 'separator' ? orientation : undefined}
      data-slot="divider"
      data-orientation={orientation}
      data-variant={variant}
      className={cx(
        'yuki-divider',
        `yuki-divider--${orientation}`,
        `yuki-divider--${variant}`,
        hasLabel && 'yuki-divider--with-label',
        hasLabel && `yuki-divider--label-${labelPosition}`,
        strong && 'yuki-divider--strong',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {hasLabel && (
        <span
          data-slot="label"
          className={cx('yuki-divider__label', classNames?.label)}
          style={styles?.label}
        >
          {children}
        </span>
      )}
    </div>
  );
});

Divider.displayName = 'Divider';
