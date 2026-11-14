import type { StyleProperties, WithStyle } from '../../styles/properties';
import { useComponentDefaults } from '../../theme';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';

export interface AspectRatioClassNames {
  root?: string;
  content?: string;
}

export interface AspectRatioStyles {
  root?: StyleProperties;
  content?: StyleProperties;
}

export interface AspectRatioProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
  /** width / height. Accepts `16 / 9`, `1.777`, or `'16/9'`. */
  ratio?: number | string;
  classNames?: AspectRatioClassNames;
  styles?: AspectRatioStyles;
}

/** Reserves intrinsic space for media so layout never jumps on load. */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio(
    inputProps,
    ref,
  ) {
    const { ratio = 1, classNames, styles, className, style, children, ...rest } = useComponentDefaults('AspectRatio', inputProps);
    return (
      <div
        ref={ref}
        {...rest}
        data-slot="aspect-ratio"
        className={cx('yuki-aspect-ratio', classNames?.root, className)}
        style={
          {
            '--yuki-aspect-ratio': ratio,
            ...styles?.root,
            ...style,
          } as StyleProperties
        }
      >
        <div
          data-slot="content"
          className={cx('yuki-aspect-ratio__content', classNames?.content)}
          style={styles?.content}
        >
          {children}
        </div>
      </div>
    );
  },
);

AspectRatio.displayName = 'AspectRatio';
