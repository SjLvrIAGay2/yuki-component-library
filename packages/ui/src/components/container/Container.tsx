import type { StyleProperties, WithStyle } from '../../styles/properties';
import { useComponentDefaults } from '../../theme';
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import { spaceValue, type SpaceSize } from '../../internal/spacing';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerClassNames {
  root?: string;
}

export interface ContainerStyles {
  root?: StyleProperties;
}

export interface ContainerProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
  /** Max content width mapped to the breakpoint scale. */
  size?: ContainerSize;
  /** Stretch edge-to-edge regardless of `size`. */
  fluid?: boolean;
  maxWidth?: CSSProperties['maxWidth'];
  /** Horizontal padding token. */
  gutter?: SpaceSize;
  /** Opt out of centering (rare). */
  center?: boolean;
  classNames?: ContainerClassNames;
  styles?: ContainerStyles;
}

/** Page-level horizontal measure and gutter. */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container(
    inputProps,
    ref,
  ) {
    const {
      size = 'lg',
      fluid = false,
      maxWidth,
      gutter = '4',
      center = true,
      classNames,
      styles,
      className,
      style,
      children,
      ...rest
    } = useComponentDefaults('Container', inputProps);
    return (
      <div
        ref={ref}
        {...rest}
        data-slot="container"
        data-size={size}
        className={cx(
          'yuki-container',
          `yuki-container--${size}`,
          fluid && 'yuki-container--fluid',
          center && 'yuki-container--center',
          classNames?.root,
          className,
        )}
        style={
          {
            '--yuki-container-gutter': spaceValue(gutter),
            maxWidth: fluid ? undefined : maxWidth,
            ...styles?.root,
            ...style,
          } as StyleProperties
        }
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
