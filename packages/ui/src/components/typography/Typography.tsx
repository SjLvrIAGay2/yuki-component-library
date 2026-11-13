import { useComponentDefaults } from '../../theme';
import {
  createElement,
  forwardRef,
  type CSSProperties,
  type ElementType,
  type FunctionComponent,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';

export type TypographySize =
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl';

export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TypographyTone =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'inverse';

export type TypographyAlign = 'start' | 'center' | 'end' | 'justify';

export interface TypographyClassNames {
  root?: string;
}

export interface TypographyStyles {
  root?: CSSProperties;
}

export interface TypographyBaseProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Render as a different element/component. */
  as?: ElementType;
  size?: TypographySize;
  weight?: TypographyWeight;
  tone?: TypographyTone;
  align?: TypographyAlign;
  /** `true` = single line, number = line clamp. */
  truncate?: boolean | number;
  /** Adds standard bottom rhythm (space-3). */
  gutterBottom?: boolean;
  strong?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  /** Renders the root as `<code>` with a quiet surface. */
  code?: boolean;
  /** Renders the root as `<mark>`. */
  mark?: boolean;
  classNames?: TypographyClassNames;
  styles?: TypographyStyles;
  children?: ReactNode;
}

function renderTag(tag: ElementType, props: Record<string, unknown>, children: ReactNode) {
  // `as` is user supplied; the cast keeps one implementation for intrinsic and
  // component tags without leaking `any` into the public surface.
  const Tag = tag as unknown as FunctionComponent<Record<string, unknown>>;
  return createElement(Tag, props, children);
}

const TypographyBase = forwardRef<HTMLElement, TypographyBaseProps>(
  function TypographyBase(
    inputProps,
    ref,
  ) {
    const {
      as,
      size,
      weight,
      tone = 'default',
      align,
      truncate = false,
      gutterBottom = false,
      strong = false,
      italic = false,
      underline = false,
      strike = false,
      code = false,
      mark = false,
      classNames,
      styles,
      className,
      children,
      style,
      ...rest
    } = useComponentDefaults('Typography', inputProps);
    const tag: ElementType = as ?? (code ? 'code' : mark ? 'mark' : 'span');
    const clamp = typeof truncate === 'number' && truncate > 1;
    return renderTag(
      tag,
      {
        ...rest,
        ref,
        className: cx(
          'yuki-typography',
          size && `yuki-typography--${size}`,
          weight && `yuki-typography--weight-${weight}`,
          tone !== 'default' && `yuki-typography--tone-${tone}`,
          align && `yuki-typography--align-${align}`,
          truncate === true && 'yuki-typography--truncate',
          clamp && 'yuki-typography--clamp',
          gutterBottom && 'yuki-typography--gutter',
          strong && 'yuki-typography--strong',
          italic && 'yuki-typography--italic',
          underline && 'yuki-typography--underline',
          strike && 'yuki-typography--strike',
          code && 'yuki-typography--code',
          mark && 'yuki-typography--mark',
          classNames?.root,
          className,
        ),
        style: {
          ...(clamp
            ? ({ '--yuki-typography-lines': truncate } as CSSProperties)
            : null),
          ...styles?.root,
          ...style,
        },
        'data-slot': 'typography',
      },
      children,
    );
  },
);

TypographyBase.displayName = 'TypographyBase';

/* -------------------------------------------------------------------------- */
/* Title                                                                       */
/* -------------------------------------------------------------------------- */

export interface TitleProps extends Omit<TypographyBaseProps, 'size' | 'as'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Explicit type scale, overriding the level-derived default. */
  size?: TypographySize;
  as?: ElementType;
  /** Remove the `hN` semantics but keep heading visuals. */
  plain?: boolean;
}

const TITLE_SIZE: Record<1 | 2 | 3 | 4 | 5 | 6, TypographySize> = {
  1: '3xl',
  2: '2xl',
  3: 'xl',
  4: 'lg',
  5: 'md',
  6: 'sm',
};

export const Title = forwardRef<HTMLElement, TitleProps>(function Title(
  { level = 3, size, as, plain = false, weight = 'semibold', ...rest },
  ref,
) {
  const tag: ElementType = as ?? (plain ? 'div' : `h${level}`);
  return (
    <TypographyBase
      ref={ref}
      as={tag}
      size={size ?? TITLE_SIZE[level]}
      weight={weight}
      {...rest}
    />
  );
});

Title.displayName = 'Title';

/* -------------------------------------------------------------------------- */
/* Text                                                                        */
/* -------------------------------------------------------------------------- */

export interface TextProps extends TypographyBaseProps {
  children?: ReactNode;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(props, ref) {
  return <TypographyBase ref={ref} {...props} />;
});

Text.displayName = 'Text';

/* -------------------------------------------------------------------------- */
/* Paragraph                                                                   */
/* -------------------------------------------------------------------------- */

export interface ParagraphProps extends Omit<TextProps, 'as'> {
  as?: ElementType;
}

export const Paragraph = forwardRef<HTMLElement, ParagraphProps>(
  function Paragraph({ as = 'p', ...rest }, ref) {
    return <TypographyBase ref={ref} as={as} {...rest} />;
  },
);

Paragraph.displayName = 'Paragraph';

const TypographyRoot = forwardRef<HTMLElement, TypographyBaseProps>(
  function Typography({ as = 'div', ...props }, ref) {
    return <TypographyBase as={as} {...props} ref={ref} />;
  },
);

/** A text container with namespace access to headings, inline text and paragraphs. */
export const Typography = Object.assign(TypographyRoot, { Title, Text, Paragraph });
