import { useComponentDefaults } from '../../theme';
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import { spaceValue, type SpaceSize } from '../../internal/spacing';

export type FlexDirection = 'row' | 'column';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';

export interface FlexClassNames {
  root?: string;
}

export interface FlexStyles {
  root?: CSSProperties;
}

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: FlexDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  gap?: SpaceSize;
  inline?: boolean;
  classNames?: FlexClassNames;
  styles?: FlexStyles;
}

/** One-dimensional layout primitive; use Grid when both axes matter. */
export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(
  inputProps,
  ref,
) {
  const {
    direction = 'row',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    gap = '0',
    inline = false,
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = useComponentDefaults('Flex', inputProps);
  return (
    <div
      ref={ref}
      {...rest}
      data-slot="flex"
      data-direction={direction}
      className={cx(
        'yuki-flex',
        direction === 'column' && 'yuki-flex--column',
        `yuki-flex--align-${align}`,
        `yuki-flex--justify-${justify}`,
        wrap && 'yuki-flex--wrap',
        inline && 'yuki-flex--inline',
        classNames?.root,
        className,
      )}
      style={{ '--yuki-flex-gap': spaceValue(gap), ...styles?.root, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
});

Flex.displayName = 'Flex';

export interface StackProps extends Omit<FlexProps, 'direction'> {
  /** Vertical by default; `horizontal` makes a row. */
  direction?: 'vertical' | 'horizontal';
}

/** Opinionated vertical rhythm for stacked content. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = 'vertical', gap = '2', ...rest },
  ref,
) {
  return (
    <Flex
      ref={ref}
      direction={direction === 'vertical' ? 'column' : 'row'}
      gap={gap}
      {...rest}
    />
  );
});

Stack.displayName = 'Stack';
