import type { StyleProperties, WithStyle } from '../../styles/properties';
import { useComponentDefaults } from '../../theme';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';
import { spaceValue, type SpaceSize } from '../../internal/spacing';

export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridJustify = 'start' | 'center' | 'end' | 'stretch' | 'between' | 'around';

export interface GridItemSpan {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface GridClassNames {
  root?: string;
  item?: string;
}

export interface GridStyles {
  root?: StyleProperties;
  item?: StyleProperties;
}

export interface GridProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
  /** Number of equal columns. Defaults to 12. */
  columns?: number;
  gap?: SpaceSize;
  rowGap?: SpaceSize;
  columnGap?: SpaceSize;
  align?: GridAlign;
  justify?: GridJustify;
  classNames?: GridClassNames;
  styles?: GridStyles;
}

/**
 * A 12-column CSS grid. Unlike float-based grids there is no negative margin,
 * so items align exactly with the surrounding rhythm.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  inputProps,
  ref,
) {
  const {
    columns = 12,
    gap = '4',
    rowGap,
    columnGap,
    align = 'stretch',
    justify = 'stretch',
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = useComponentDefaults('Grid', inputProps);
  return (
    <div
      ref={ref}
      {...rest}
      data-slot="grid"
      data-columns={columns}
      className={cx(
        'yuki-grid',
        `yuki-grid--align-${align}`,
        `yuki-grid--justify-${justify}`,
        classNames?.root,
        className,
      )}
      style={{
        '--yuki-grid-columns': columns,
        '--yuki-grid-gap': spaceValue(gap),
        '--yuki-grid-row-gap': rowGap ? spaceValue(rowGap) : undefined,
        '--yuki-grid-column-gap': columnGap ? spaceValue(columnGap) : undefined,
        ...styles?.root,
        ...style,
      } as StyleProperties}
    >
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

export interface GridItemProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
  /** Columns to span at the base breakpoint. */
  span?: number;
  /** Column to start at (1-based). */
  start?: number;
  /** Responsive span overrides, mobile-first. */
  responsive?: GridItemSpan;
  classNames?: GridClassNames;
  styles?: GridStyles;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  function GridItem(
    { span = 12, start, responsive, classNames, styles, className, style, children, ...rest },
    ref,
  ) {
    const breakpoints = Object.entries(responsive ?? {}) as [
      keyof GridItemSpan,
      number,
    ][];

    return (
      <div
        ref={ref}
        {...rest}
        data-slot="grid-item"
        data-span={span}
        className={cx(
          'yuki-grid__item',
          `yuki-grid__item--span-${span}`,
          start !== undefined && `yuki-grid__item--start-${start}`,
          ...breakpoints.map(([bp, value]) => `yuki-grid__item--${bp}-span-${value}`),          classNames?.item,
          className,
        )}
        style={{ ...styles?.item, ...style }}
      >
        {children}
      </div>
    );
  },
);

GridItem.displayName = 'GridItem';
