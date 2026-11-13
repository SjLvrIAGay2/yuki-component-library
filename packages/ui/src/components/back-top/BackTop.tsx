import {
  forwardRef,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useEventCallback, usePrefersReducedMotion } from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

export interface BackTopClassNames {
  root?: string;
  arrow?: string;
  content?: string;
}

export interface BackTopStyles {
  root?: CSSProperties;
  arrow?: CSSProperties;
  content?: CSSProperties;
}

export interface BackTopProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Scroll distance (px) after which the button appears. */
  visibilityHeight?: number;
  threshold?: number;
  /** Scroll container factory, defaults to `window`. */
  target?: HTMLElement | null | (() => HTMLElement | Window | null);
  /** Custom content instead of the arrow glyph. */
  children?: ReactNode;
  size?: Size;
  classNames?: BackTopClassNames;
  styles?: BackTopStyles;
}

const getWindow = (): Window | null => (typeof window === 'undefined' ? null : window);

/**
 * Fixed "back to top" button. Appears after `visibilityHeight` and scrolls the
 * target container smoothly unless the user prefers reduced motion.
 */
export const BackTop = forwardRef<HTMLButtonElement, BackTopProps>(function BackTop(
  inputProps,
  ref,
) {
  const {
    threshold,
    visibilityHeight = threshold ?? 400,
    target,
    children,
    size: sizeProp,
    classNames,
    styles,
    className,
    style,
    onClick,
    'aria-label': ariaLabel,
    ...rest
  } = useComponentDefaults('BackTop', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  const resolveTarget = useEventCallback((): HTMLElement | Window | null =>
    typeof target === 'function' ? target() : target ?? getWindow(),
  );

  useEffect(() => {
    const container = resolveTarget();
    if (!container) return undefined;
    const isElement = typeof Element !== 'undefined' && container instanceof Element;
    const handleScroll = () => {
      const top = isElement
        ? (container as HTMLElement).scrollTop
        : (container as Window).scrollY || (container as Window).document.documentElement.scrollTop;
      setVisible(top >= visibilityHeight);
    };
    const scrollTarget: HTMLElement | Window = isElement
      ? (container as HTMLElement)
      : (container as Window);
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => scrollTarget.removeEventListener('scroll', handleScroll);
  }, [resolveTarget, target, visibilityHeight]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const container = resolveTarget();
    if (!container) return;
    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
    if (typeof Element !== 'undefined' && container instanceof Element) {
      (container as HTMLElement).scrollTo({ top: 0, behavior });
    } else {
      (container as Window).scrollTo({ top: 0, behavior });
    }
  };

  if (!visible) return null;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={cx('yuki-back-top', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-slot="back-top"
      data-size={size}
      aria-label={ariaLabel ?? t('backTop.label', { 'zh-CN': '回到顶部', 'en-US': 'Back to top' })}
      onClick={handleClick}
    >
      {children ? (
        <span
          className={cx('yuki-back-top__content', classNames?.content)}
          style={styles?.content}
          data-slot="back-top-content"
        >
          {children}
        </span>
      ) : (
        <span
          className={cx('yuki-back-top__arrow', classNames?.arrow)}
          style={styles?.arrow}
          data-slot="back-top-arrow"
          aria-hidden="true"
        />
      )}
    </button>
  );
});

BackTop.displayName = 'BackTop';
