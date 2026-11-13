import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useEventCallback } from '../../hooks';

export interface AffixClassNames {
  root?: string;
  affix?: string;
}

export interface AffixStyles {
  root?: CSSProperties;
  affix?: CSSProperties;
}

export interface AffixProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Distance (px) from the top of the container when pinned. */
  offsetTop?: number;
  /** Pin to the bottom of the container instead of the top. */
  offsetBottom?: number;
  /** Scroll container factory, defaults to `window`. */
  target?: () => HTMLElement | Window | null;
  /** Fired when the pinned state changes. */
  onChange?: (affixed: boolean) => void;
  children?: ReactNode;
  classNames?: AffixClassNames;
  styles?: AffixStyles;
}

/**
 * Pins content inside a scroll container once it passes `offsetTop` /
 * `offsetBottom`, keeping a placeholder to avoid layout jumps.
 */
export const Affix = forwardRef<HTMLDivElement, AffixProps>(function Affix(
  inputProps,
  ref,
) {
  const {
    offsetTop = 0,
    offsetBottom,
    target,
    onChange,
    children,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Affix', inputProps);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [affixed, setAffixed] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0, top: 0 });

  const resolveTarget = useEventCallback((): HTMLElement | Window | null =>
    target ? target() : typeof window === 'undefined' ? null : window,
  );
  const handleChange = useEventCallback((next: boolean) => {
    setAffixed((current) => {
      if (current === next) return current;
      onChange?.(next);
      return next;
    });
  });

  useEffect(() => {
    const container = resolveTarget();
    const root = rootRef.current;
    if (!container || !root) return undefined;
    const isElement = typeof Element !== 'undefined' && container instanceof Element;

    const update = () => {
      const rect = root.getBoundingClientRect();
      const containerRect = isElement
        ? (container as HTMLElement).getBoundingClientRect()
        : { top: 0, bottom: typeof window === 'undefined' ? 0 : window.innerHeight };
      if (offsetBottom !== undefined) {
        const pinned = rect.bottom > containerRect.bottom - offsetBottom;
        handleChange(pinned);
        if (pinned) setLayout((prev) => ({ ...prev, width: rect.width, height: rect.height }));
        return;
      }
      const pinned = rect.top < containerRect.top + offsetTop;
      handleChange(pinned);
      if (pinned) {
        setLayout({ width: rect.width, height: rect.height, top: containerRect.top + offsetTop });
      }
    };

    const scrollTarget: HTMLElement | Window = isElement
      ? (container as HTMLElement)
      : (container as Window);
    scrollTarget.addEventListener('scroll', update, { passive: true });
    if (!isElement) window.addEventListener('resize', update);
    return () => {
      scrollTarget.removeEventListener('scroll', update);
      if (!isElement) window.removeEventListener('resize', update);
    };
  }, [handleChange, offsetBottom, offsetTop, resolveTarget]);

  const affixStyle: CSSProperties | undefined = affixed
    ? {
        position: 'fixed',
        insetInlineStart: undefined,
        inlineSize: layout.width || undefined,
        ...(offsetBottom !== undefined
          ? { insetBlockEnd: offsetBottom, insetBlockStart: 'auto' }
          : { insetBlockStart: layout.top, insetBlockEnd: 'auto' }),
      }
    : undefined;

  return (
    <div
      {...rest}
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cx('yuki-affix', classNames?.root, className)}
      style={{
        ...(affixed ? { blockSize: layout.height || undefined } : undefined),
        ...styles?.root,
        ...style,
      }}
      data-slot="affix"
      data-affixed={affixed ? 'true' : 'false'}
    >
      <div
        className={cx('yuki-affix__element', classNames?.affix)}
        style={{ ...affixStyle, ...styles?.affix }}
        data-slot="affix-element"
      >
        {children}
      </div>
    </div>
  );
});

Affix.displayName = 'Affix';
