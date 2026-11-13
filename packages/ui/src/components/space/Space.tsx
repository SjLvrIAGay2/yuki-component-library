import { useComponentDefaults } from '../../theme';
import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { spaceValue, type SpaceSize } from '../../internal/spacing';

export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceAlign = 'start' | 'center' | 'end' | 'baseline';

export interface SpaceClassNames {
  root?: string;
  item?: string;
  split?: string;
}

export interface SpaceStyles {
  root?: CSSProperties;
  item?: CSSProperties;
  split?: CSSProperties;
}

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  direction?: SpaceDirection;
  vertical?: boolean;
  gap?: CSSProperties['gap'];
  /** Single token, or `[horizontal, vertical]` for wrapping groups. */
  size?: SpaceSize | [SpaceSize, SpaceSize];
  align?: SpaceAlign;
  wrap?: boolean;
  /** Element rendered between each pair of children (e.g. a vertical Divider). */
  split?: ReactNode;
  classNames?: SpaceClassNames;
  styles?: SpaceStyles;
}

/** Evenly spaced inline content with optional separators. */
export const Space = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  inputProps,
  ref,
) {
  const {
    vertical,
    gap: customGap,
    direction = vertical ? 'vertical' : 'horizontal',
    size = '2',
    align = 'center',
    wrap = false,
    split,
    classNames,
    styles,
    className,
    style,
    children,
    ...rest
  } = useComponentDefaults('Space', inputProps);
  const gap = Array.isArray(size) ? size[0] : size;
  const rowGap = Array.isArray(size) ? size[1] : size;
  // Children.toArray already drops null/undefined/booleans and flattens arrays.
  const items = Children.toArray(children);

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="space"
      data-direction={direction}
      className={cx(
        'yuki-space',
        `yuki-space--${direction}`,
        `yuki-space--align-${align}`,
        wrap && 'yuki-space--wrap',
        classNames?.root,
        className,
      )}
      style={
        {
          '--yuki-space-gap': spaceValue(gap),
          '--yuki-space-row-gap': spaceValue(rowGap),
          gap: customGap,
          ...styles?.root,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((child, index) => (
        <Fragment key={isValidElement(child) ? child.key : index}>
          {split !== undefined && index > 0 && (
            <span
              data-slot="split"
              className={cx('yuki-space__split', classNames?.split)}
              style={styles?.split}
              aria-hidden="true"
            >
              {split}
            </span>
          )}
          <div
            data-slot="item"
            className={cx('yuki-space__item', classNames?.item)}
            style={styles?.item}
          >
            {child}
          </div>
        </Fragment>
      ))}
    </div>
  );
});

Space.displayName = 'Space';
