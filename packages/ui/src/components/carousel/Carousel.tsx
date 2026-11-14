import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useEventCallback, usePrefersReducedMotion } from '../../hooks';
import { useComponentDefaults, useComponentSize, useConfig, useLocale, type Size } from '../../theme';
import { inertValue } from '../../internal/inert';
import { Icon } from '../icon/Icon';

export type CarouselEffect = 'slide' | 'fade';

export interface CarouselClassNames {
  root?: string;
  viewport?: string;
  track?: string;
  slide?: string;
  arrow?: string;
  dots?: string;
  dot?: string;
}

export interface CarouselStyles {
  root?: StyleProperties;
  viewport?: StyleProperties;
  track?: StyleProperties;
  slide?: StyleProperties;
  arrow?: StyleProperties;
  dots?: StyleProperties;
  dot?: StyleProperties;
}

export interface CarouselProps
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'onChange' | 'children'> {
  /** 幻灯片列表（优先于 children）。 */
  items?: ReactNode[];
  /** 幻灯片；也可通过 items 传入。 */
  children?: ReactNode;
  /** 受控的当前索引。 */
  activeIndex?: number;
  /** 非受控的初始索引。 */
  defaultActiveIndex?: number;
  /** 切换时触发。 */
  onChange?: (activeIndex: number) => void;
  /** 是否自动播放。 */
  autoplay?: boolean;
  /** 自动播放间隔（毫秒）。 */
  autoplayInterval?: number;
  /** 悬停 / 聚焦时是否暂停自动播放。 */
  pauseOnHover?: boolean;
  /** 是否循环。 */
  loop?: boolean;
  /** 是否展示指示点。 */
  dots?: boolean;
  /** 是否展示左右箭头。 */
  arrows?: boolean;
  /** 是否支持指针滑动。 */
  swipe?: boolean;
  /** 切换效果。 */
  effect?: CarouselEffect;
  /** 是否纵向排列。 */
  vertical?: boolean;
  /** 尺寸。 */
  size?: Size;
  /** 无障碍名称。 */
  ariaLabel?: string;
  classNames?: CarouselClassNames;
  styles?: CarouselStyles;
}

const SWIPE_THRESHOLD = 40;

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    inputProps,
    ref,
  ) {
    const {
      items,
      children,
      activeIndex: activeIndexProp,
      defaultActiveIndex = 0,
      onChange,
      autoplay = false,
      autoplayInterval = 3000,
      pauseOnHover = true,
      loop = true,
      dots = true,
      arrows = true,
      swipe = true,
      effect = 'slide',
      vertical = false,
      size: sizeProp,
      ariaLabel,
      classNames,
      styles,
      className,
      style,
      onMouseEnter,
      onMouseLeave,
      onFocusCapture,
      onBlurCapture,
      onKeyDown,
      ...rest
    } = useComponentDefaults('Carousel', inputProps);
    const size = useComponentSize(sizeProp);
    const { t } = useLocale();
    const slides = items ?? Children.toArray(children);
    const count = slides.length;

    const [activeIndex, setActiveIndex] = useControllableState<number>({
      value: activeIndexProp,
      defaultValue: defaultActiveIndex,
      onChange,
    });

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pageHidden, setPageHidden] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const paused = !useConfig().motion || reducedMotion || pageHidden || (pauseOnHover && (hovered || focused));
    useEffect(() => {
      if (!autoplay) return;
      const update = () => setPageHidden(document.hidden);
      update();
      document.addEventListener('visibilitychange', update);
      return () => document.removeEventListener('visibilitychange', update);
    }, [autoplay]);

    const goTo = useCallback(
      (index: number) => {
        if (count === 0) return;
        const next = loop
          ? ((index % count) + count) % count
          : Math.min(Math.max(index, 0), count - 1);
        if (next !== activeIndex) setActiveIndex(next);
      },
      [activeIndex, count, loop, setActiveIndex],
    );

    const advance = useEventCallback((delta: number) => {
      goTo(activeIndex + delta);
    });

    useEffect(() => {
      if (!autoplay || count < 2 || paused) return;
      const timer = window.setInterval(() => {
        advance(1);
      }, Math.max(200, autoplayInterval));
      return () => {
        window.clearInterval(timer);
      };
    }, [advance, autoplay, autoplayInterval, count, paused]);

    const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!swipe || !event.isPrimary || event.button !== 0) return;
      pointerStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!swipe || pointerStart.current?.id !== event.pointerId) return;
      const deltaX = event.clientX - pointerStart.current.x;
      const deltaY = event.clientY - pointerStart.current.y;
      pointerStart.current = null;
      const delta = vertical ? deltaY : deltaX;
      if (!Number.isFinite(delta) || Math.abs(delta) < SWIPE_THRESHOLD || Math.abs(delta) <= Math.abs(vertical ? deltaX : deltaY)) return;
      if (delta < 0) advance(1);
      else advance(-1);
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.target !== event.currentTarget) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        advance(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        advance(-1);
      }
    };

    const atStart = !loop && activeIndex <= 0;
    const atEnd = !loop && activeIndex >= count - 1;
    const prevLabel = t('carousel.prev', {
      'zh-CN': '上一张',
      en: 'Previous slide',
    });
    const nextLabel = t('carousel.next', {
      'zh-CN': '下一张',
      en: 'Next slide',
    });

    return (
      <div
        ref={ref}
        {...rest}
        role="region"
        aria-roledescription="carousel"
        aria-label={
          ariaLabel ??
          t('carousel.label', { 'zh-CN': '轮播', en: 'Carousel' })
        }
        tabIndex={0}
        data-slot="carousel"
        data-size={size}
        data-effect={effect}
        data-orientation={vertical ? 'vertical' : 'horizontal'}
        className={cx(
          'yuki-carousel',
          `yuki-carousel--${size}`,
          `yuki-carousel--${effect}`,
          vertical && 'yuki-carousel--vertical',
          classNames?.root,
          className,
        )}
        style={{ ...styles?.root, ...style }}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          setHovered(true);
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          setHovered(false);
        }}
        onFocusCapture={(event) => {
          onFocusCapture?.(event);
          setFocused(true);
        }}
        onBlurCapture={(event) => {
          onBlurCapture?.(event);
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onKeyDown={handleKeyDown}
      >
        <div
          data-slot="viewport"
          className={cx('yuki-carousel__viewport', classNames?.viewport)}
          style={styles?.viewport}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
        >
          <div
            data-slot="track"
            className={cx('yuki-carousel__track', classNames?.track)}
            style={{
              ...(effect === 'slide'
                ? {
                    transform: vertical
                      ? `translateY(-${activeIndex * 100}%)`
                      : `translateX(-${activeIndex * 100}%)`,
                  }
                : null),
              ...styles?.track,
            }}
            aria-live={autoplay ? 'off' : 'polite'}
          >
            {slides.map((slide, index) => {
              const active = index === activeIndex;
              return (
                <div
                  key={index}
                  data-slot="slide"
                  data-active={active || undefined}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} / ${count}`}
                  inert={inertValue(!active)}
                  aria-hidden={active ? undefined : true}
                  className={cx(
                    'yuki-carousel__slide',
                    active && 'yuki-carousel__slide--active',
                    classNames?.slide,
                  )}
                  style={styles?.slide}
                >
                  {slide}
                </div>
              );
            })}
          </div>
        </div>

        {arrows && count > 1 ? (
          <>
            <button
              type="button"
              data-slot="arrow"
              data-direction="prev"
              aria-label={prevLabel}
              disabled={atStart}
              className={cx(
                'yuki-carousel__arrow',
                'yuki-carousel__arrow--prev',
                classNames?.arrow,
              )}
              style={styles?.arrow}
              onClick={() => advance(-1)}
            >
              <Icon name={vertical ? 'chevron-up' : 'chevron-left'} />
            </button>
            <button
              type="button"
              data-slot="arrow"
              data-direction="next"
              aria-label={nextLabel}
              disabled={atEnd}
              className={cx(
                'yuki-carousel__arrow',
                'yuki-carousel__arrow--next',
                classNames?.arrow,
              )}
              style={styles?.arrow}
              onClick={() => advance(1)}
            >
              <Icon name={vertical ? 'chevron-down' : 'chevron-right'} />
            </button>
          </>
        ) : null}

        {dots && count > 1 ? (
          <div
            role="group"
            aria-label={t('carousel.pagination', {
              'zh-CN': '轮播分页',
              en: 'Carousel pagination',
            })}
            data-slot="dots"
            className={cx('yuki-carousel__dots', classNames?.dots)}
            style={styles?.dots}
          >
            {slides.map((_, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={index}
                  type="button"
                  data-slot="dot"
                  aria-label={t(
                    'carousel.goTo',
                    {
                      'zh-CN': `转到第 ${index + 1} 张`,
                      en: `Go to slide ${index + 1}`,
                    },
                    { index: index + 1 },
                  )}
                  aria-current={active ? 'true' : undefined}
                  className={cx(
                    'yuki-carousel__dot',
                    active && 'yuki-carousel__dot--active',
                    classNames?.dot,
                  )}
                  style={styles?.dot}
                  onClick={() => goTo(index)}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    );
  },
);

Carousel.displayName = 'Carousel';
