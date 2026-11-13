import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import {
  useControllableState,
  useEventCallback,
  useMergedRefs,
  usePrefersReducedMotion,
} from '../../hooks';
import { useComponentDefaults, useLocale } from '../../theme';

export interface AnchorItem {
  key?: string;
  /** In-page target such as `#installation`. */
  href: string;
  title?: ReactNode;
  label?: ReactNode;
  children?: AnchorItem[];
}

export interface AnchorClassNames {
  root?: string;
  list?: string;
  item?: string;
  link?: string;
  activeLink?: string;
  subList?: string;
}

export interface AnchorStyles {
  root?: CSSProperties;
  list?: CSSProperties;
  item?: CSSProperties;
  link?: CSSProperties;
  activeLink?: CSSProperties;
  subList?: CSSProperties;
}

export interface AnchorProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: AnchorItem[];
  /** Key of the active link, controlled. */
  activeKey?: string;
  current?: string;
  /** Initial active key, uncontrolled. */
  defaultActiveKey?: string;
  /** Distance from the viewport top used to pick the active anchor. */
  offsetTop?: number;
  /** Distance used when scrolling to a target. */
  targetOffset?: number;
  /** Scroll container, defaults to `window`. */
  getContainer?: () => HTMLElement | Window | null;
  /** Fires whenever the scroll-spy or a click changes the active link. */
  onChange?: (activeKey: string) => void;
  classNames?: AnchorClassNames;
  styles?: AnchorStyles;
}

const scrollBehavior = (reduced: boolean): ScrollBehavior =>
  reduced ? 'auto' : 'smooth';

/**
 * Scroll-spy navigation. Tracks the container with an IntersectionObserver and
 * a scroll fallback, then exposes the active link through `onChange`.
 */
export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  inputProps,
  ref,
) {
  const {
    items,
    current, activeKey,
    defaultActiveKey,
    offsetTop = 0,
    targetOffset,
    getContainer,
    onChange,
    classNames,
    styles,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  } = useComponentDefaults('Anchor', inputProps);
  const { t } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const navRef = useRef<HTMLElement | null>(null);
  const mergedNavRef = useMergedRefs<HTMLElement>(navRef, ref);
  const flatItems = useMemo(() => {
    const flattened: AnchorItem[] = [];
    const visit = (list: AnchorItem[]) => {
      for (const item of list) {
        flattened.push(item);
        if (item.children) visit(item.children);
      }
    };
    visit(items);
    return flattened;
  }, [items]);
  const [active, setActive] = useControllableState<string | undefined>({
    value: activeKey ?? (current !== undefined ? flatItems.find(item => item.href === current)?.key ?? current : undefined),
    defaultValue: defaultActiveKey ?? items[0]?.key ?? items[0]?.href,
    onChange: (key) => {
      if (key) onChange?.(key);
    },
  });

  const resolveContainer = useEventCallback((): HTMLElement | Window | null => {
    if (getContainer) return getContainer();
    return typeof window === 'undefined' ? null : window;
  });

  const isElementContainer = (container: HTMLElement | Window): container is HTMLElement =>
    typeof Element !== 'undefined' && container instanceof Element;

  const computeActive = useEventCallback(() => {
    if (typeof document === 'undefined') return;
    const container = resolveContainer();
    if (!container) return;
    const containerTop = isElementContainer(container)
      ? container.getBoundingClientRect().top
      : 0;
    const threshold = targetOffset ?? offsetTop;
    let candidate: string | undefined;

    for (const item of flatItems) {
      const id = item.href.startsWith('#') ? item.href.slice(1) : '';
      if (!id) continue;
      const target = document.getElementById(id);
      if (!target) continue;
      const top = target.getBoundingClientRect().top - containerTop;
      if (top <= threshold) candidate = item.key ?? item.href;
    }

    if (isElementContainer(container)) {
      const nearBottom =
        container.scrollHeight > 0 &&
        container.scrollHeight - container.scrollTop - container.clientHeight <= 2;
      if (nearBottom) candidate = flatItems.at(-1)?.key ?? flatItems.at(-1)?.href;
    } else if (typeof window !== 'undefined') {
      const doc = document.documentElement;
      const nearBottom =
        doc.scrollHeight > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      if (nearBottom) candidate = flatItems.at(-1)?.key ?? flatItems.at(-1)?.href;
    }

    if (candidate && candidate !== active) setActive(candidate);
  });

  useEffect(() => {
    const container = resolveContainer();
    if (!container) return undefined;
    const handleScroll = () => computeActive();
    const scrollTarget: HTMLElement | Window = isElementContainer(container) ? container : window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (visible.length === 0) {
            computeActive();
            return;
          }
          const best = visible.reduce((winner, entry) =>
            entry.intersectionRatio > winner.intersectionRatio ? entry : winner,
          );
          const id = (best.target as HTMLElement).id;
          const match = flatItems.find((item) => item.href === `#${id}`);
          if (match) setActive(match.key ?? match.href);
        },
        {
          root: isElementContainer(container) ? container : null,
          rootMargin: `-${offsetTop}px 0px -70% 0px`,
          threshold: [0, 0.25, 0.5, 1],
        },
      );
      for (const item of flatItems) {
        const id = item.href.startsWith('#') ? item.href.slice(1) : '';
        const target = id ? document.getElementById(id) : null;
        if (target) observer.observe(target);
      }
    }

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, [computeActive, flatItems, offsetTop, resolveContainer, getContainer, setActive]);

  const scrollToTarget = (event: MouseEvent<HTMLAnchorElement>, item: AnchorItem) => {
    const id = item.href.startsWith('#') ? item.href.slice(1) : '';
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    const container = resolveContainer();
    const behavior = scrollBehavior(reducedMotion);
    const offset = targetOffset ?? offsetTop;
    if (container && isElementContainer(container)) {
      const containerTop = container.getBoundingClientRect().top;
      const top = target.getBoundingClientRect().top - containerTop + container.scrollTop - offset;
      container.scrollTo({ top, behavior });
    } else if (typeof window !== 'undefined') {
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior });
    }
    setActive(item.key ?? item.href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const links = Array.from(
      navRef.current?.querySelectorAll<HTMLAnchorElement>('[data-slot="anchor-link"]') ?? [],
    );
    if (links.length === 0) return;
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      links[(current + 1) % links.length]?.focus();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      links[(current - 1 + links.length) % links.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      links[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      links[links.length - 1]?.focus();
    }
  };

  const renderItems = (source: AnchorItem[], nested = false): ReactNode => (
    <ul
      className={cx(
        nested ? 'yuki-anchor__sub-list' : 'yuki-anchor__list',
        nested ? classNames?.subList : classNames?.list,
      )}
      style={nested ? styles?.subList : styles?.list}
      data-slot={nested ? 'anchor-sub-list' : 'anchor-list'}
    >
      {source.map((item) => {
        const itemKey = item.key ?? item.href;
        const isActive = itemKey === active;
        return (
          <li
            key={itemKey}
            className={cx('yuki-anchor__item', classNames?.item)}
            style={styles?.item}
            data-slot="anchor-item"
            data-active={isActive ? '' : undefined}
          >
            <a
              href={item.href}
              className={cx(
                'yuki-anchor__link',
                classNames?.link,
                isActive && 'yuki-anchor__link--active',
                isActive && classNames?.activeLink,
              )}
              style={isActive ? { ...styles?.link, ...styles?.activeLink } : styles?.link}
              data-slot="anchor-link"
              data-anchor-key={itemKey}
              data-active={isActive ? '' : undefined}
              aria-current={isActive ? 'location' : undefined}
              onClick={(event) => scrollToTarget(event, item)}
            >
              {item.title ?? item.label}
            </a>
            {item.children && item.children.length > 0
              ? renderItems(item.children, true)
              : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      {...rest}
      ref={mergedNavRef}
      className={cx('yuki-anchor', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-slot="anchor"
      aria-label={ariaLabel ?? t('anchor.label', { 'zh-CN': '锚点导航', 'en-US': 'Anchor' })}
      onKeyDown={handleKeyDown}
    >
      {renderItems(items)}
    </nav>
  );
});

Anchor.displayName = 'Anchor';
