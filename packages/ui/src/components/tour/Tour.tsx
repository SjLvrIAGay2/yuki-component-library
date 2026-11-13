import {
  cloneElement,
  type ReactElement,
  type MouseEvent,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx } from '../../internal/cx';
import { useIsomorphicLayoutEffect } from '../../internal/useIsomorphicLayoutEffect';
import { Portal } from '../../internal/Portal';
import {
  useControllableState,
  useEscapeKey,
  useEventCallback,
  useFloating,
  useFocusTrap,
  useMergedRefs,
  type Placement,
} from '../../hooks';
import { useComponentDefaults, useLocale } from '../../theme';
import { Button } from '../button';

export interface TourStep {
  /** CSS selector or resolver returning the element this step highlights. */
  target?: string | (() => HTMLElement | null | undefined);
  title?: ReactNode;
  description?: ReactNode;
  /** Visual rendered above the title inside the panel. */
  cover?: ReactNode;
  /** Preferred panel side; flips when there is not enough room. @default 'bottom' */
  placement?: Placement;
  className?: string;
  style?: CSSProperties;
}

export interface TourClassNames {
  root?: string;
  mask?: string;
  spotlight?: string;
  popup?: string;
  arrow?: string;
  header?: string;
  cover?: string;
  title?: string;
  description?: string;
  footer?: string;
  indicator?: string;
  actions?: string;
  skip?: string;
  prev?: string;
  next?: string;
}

export interface TourStyles {
  root?: CSSProperties;
  mask?: CSSProperties;
  spotlight?: CSSProperties;
  popup?: CSSProperties;
  arrow?: CSSProperties;
  header?: CSSProperties;
  cover?: CSSProperties;
  title?: CSSProperties;
  description?: CSSProperties;
  footer?: CSSProperties;
  indicator?: CSSProperties;
  actions?: CSSProperties;
  skip?: CSSProperties;
  prev?: CSSProperties;
  next?: CSSProperties;
}

export interface TourProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'> {
  steps: readonly TourStep[];
  trigger?: ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void; 'aria-haspopup'?: 'dialog'; 'aria-expanded'?: boolean }>;
  /** Controlled open state. */
  open?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled active index. */
  current?: number;
  /** Uncontrolled initial active index. @default 0 */
  defaultCurrent?: number;
  onCurrentChange?: (current: number) => void;
  /** Fired after the last step is confirmed. */
  onFinish?: () => void;
  /** Fired when the tour is skipped or dismissed with Escape. */
  onSkip?: () => void;
  /** Close on Escape. @default true */
  closeOnEscape?: boolean;
  /** Render the dimmed backdrop. @default true */
  mask?: boolean;
  /** Skip when the backdrop is pressed. @default false */
  maskClosable?: boolean;
  /** Render the connector arrow between panel and target. @default true */
  arrow?: boolean;
  /** Arrow-key navigation between steps. @default true */
  keyboard?: boolean;
  /** Scroll the highlighted target into view. @default true */
  scrollIntoView?: boolean;
  /** Extra breathing room around the highlighted target, in px. @default 6 */
  padding?: number;
  skipText?: ReactNode;
  prevText?: ReactNode;
  nextText?: ReactNode;
  finishText?: ReactNode;
  /** Portal target; defaults to the ConfigProvider popup host. */
  container?: HTMLElement | null;
  classNames?: TourClassNames;
  styles?: TourStyles;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveTarget(target: TourStep['target']): HTMLElement | null {
  if (!target || typeof document === 'undefined') return null;
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
  return target() ?? null;
}

const px = (value: number): string => `${Math.round(value)}px`;

/**
 * Guided walkthrough: spotlights one anchor at a time, moves focus into the
 * step panel and navigates with buttons or the left/right arrow keys.
 */
export const Tour = forwardRef<HTMLDivElement, TourProps>(function Tour(
  inputProps,
  ref,
) {
  const {
    steps, trigger,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    current: currentProp,
    defaultCurrent = 0,
    onCurrentChange,
    onFinish,
    onSkip,
    closeOnEscape = true,
    mask = true,
    maskClosable = false,
    arrow = true,
    keyboard = true,
    scrollIntoView = true,
    padding = 6,
    skipText,
    prevText,
    nextText,
    finishText,
    container,
    classNames,
    styles,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    ...rest
  } = useComponentDefaults('Tour', inputProps);
  const { t } = useLocale();
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [currentIndex, setCurrentIndex] = useControllableState<number>({
    value: currentProp,
    defaultValue: defaultCurrent,
    onChange: onCurrentChange,
  });

  const stepCount = steps.length;
  const index = stepCount === 0 ? 0 : Math.min(Math.max(currentIndex, 0), stepCount - 1);
  const step = steps[index];

  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const resolvedRef = useRef<HTMLElement | null>(null);
  const titleId = `yuki-tour-title-${useId()}`;
  const descriptionId = `yuki-tour-description-${useId()}`;

  const anchorRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null);
  const mergedPanelRef = useMergedRefs<HTMLDivElement>(ref, floatingRef, setPanelNode);
  const trapRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({ current: panelNode }),
    [panelNode],
  );

  const placement = step?.placement ?? 'bottom';
  const floating = useFloating({
    open: open && targetEl !== null,
    anchorRef,
    floatingRef,
    placement,
    offset: 12,
  });

  // Keep the active index in range if the step list shrinks.
  useEffect(() => {
    if (open && stepCount > 0 && currentIndex !== index) setCurrentIndex(index);
  }, [open, stepCount, currentIndex, index, setCurrentIndex]);

  // Resolve the highlighted element for the active step.
  useIsomorphicLayoutEffect(() => {
    if (!open || !step) {
      resolvedRef.current = null;
      setTargetEl(null);
      return;
    }
    const element = resolveTarget(step.target);
    if (element !== resolvedRef.current) {
      resolvedRef.current = element;
      if (element && scrollIntoView) element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      setTargetEl(element);
    }
  }, [open, step, stepCount, scrollIntoView]);

  // Track the spotlight rectangle across scrolling and resizing.
  useIsomorphicLayoutEffect(() => {
    if (!open || !targetEl) {
      setRect(null);
      return;
    }
    const update = () => {
      const next = targetEl.getBoundingClientRect();
      setRect((prev) =>
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
          ? prev
          : { top: next.top, left: next.left, width: next.width, height: next.height },
      );
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(targetEl);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [open, targetEl]);

  // Measure once the portalled panel is mounted.
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => floating.measure());
    return () => window.cancelAnimationFrame(frame);
  }, [open, index, targetEl, floating.measure]);

  useFocusTrap(trapRef, { active: open && stepCount > 0, restoreFocus: true });

  const finish = useEventCallback(() => {
    onFinish?.();
    setOpen(false);
  });

  const skip = useEventCallback(() => {
    onSkip?.();
    setOpen(false);
  });

  const go = useEventCallback((next: number) => {
    const clamped = Math.min(Math.max(next, 0), stepCount - 1);
    if (clamped === index) return;
    setCurrentIndex(clamped);
  });

  const handleNext = useEventCallback(() => {
    if (index >= stepCount - 1) finish();
    else go(index + 1);
  });

  const handlePrev = useEventCallback(() => {
    go(index - 1);
  });

  useEscapeKey(skip, open && closeOnEscape && stepCount > 0);

  useEffect(() => {
    if (!open || !keyboard || !stepCount) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const active = event.target as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, keyboard, stepCount, handleNext, handlePrev]);

  // Move focus to the panel whenever the step changes.
  useEffect(() => {
    if (!open || !panelNode) return;
    const frame = window.requestAnimationFrame(() => panelNode.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [open, index, panelNode]);

  anchorRef.current = targetEl;

  if (!step) return null;
  const launcher = trigger ? cloneElement(trigger, {
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    onClick: (event) => {
      trigger.props.onClick?.(event);
      if (event.defaultPrevented || open) return;
      if (currentProp === undefined) setCurrentIndex(defaultCurrent);
      setOpen(true);
    },
  }) : null;
  if (!open) return launcher;

  const maskClick = () => {
    if (maskClosable) skip();
  };

  const spotlight: SpotlightRect | null = rect;
  const maskStyleOf = (side: string): CSSProperties | undefined => {
    if (!spotlight) return undefined;
    const { top, left, width, height } = spotlight;
    const topStart = Math.max(top - padding, 0);
    const leftStart = Math.max(left - padding, 0);
    if (side === 'top') return { top: 0, left: 0, right: 0, height: px(topStart) };
    if (side === 'bottom') return { top: px(topStart + height + padding * 2), left: 0, right: 0, bottom: 0 };
    if (side === 'left') return { top: px(topStart), left: 0, width: px(leftStart), height: px(height + padding * 2) };
    return { top: px(topStart), right: 0, left: px(leftStart + width + padding * 2), height: px(height + padding * 2) };
  };

  const panelStyle: CSSProperties = targetEl
    ? {
        ...floating.floatingStyles,
        ...styles?.popup,
        zIndex: 'var(--yuki-z-tour)' as unknown as number,
      }
    : { ...styles?.popup };

  const lastStep = index === stepCount - 1;

  return (
    <>
    {launcher}
    <Portal container={container}>
      <div
        {...rest}
        className={cx('yuki-tour', classNames?.root, className)}
        style={{ ...style, ...styles?.root }}
        data-slot="root"
        data-current={index}
      >
        {mask &&
          (spotlight ? (
            <>
              {(['top', 'left', 'right', 'bottom'] as const).map((side) => (
                <div
                  key={side}
                  className={cx('yuki-tour__mask', classNames?.mask)}
                  style={{ ...maskStyleOf(side), ...styles?.mask }}
                  data-slot="mask"
                  data-side={side}
                  aria-hidden="true"
                  onClick={maskClick}
                />
              ))}
              <div
                className={cx('yuki-tour__spotlight', classNames?.spotlight)}
                style={{
                  top: px(spotlight.top - padding),
                  left: px(spotlight.left - padding),
                  width: px(spotlight.width + padding * 2),
                  height: px(spotlight.height + padding * 2),
                  ...styles?.spotlight,
                }}
                data-slot="spotlight"
                aria-hidden="true"
              />
            </>
          ) : (
            <div
              className={cx('yuki-tour__mask', 'yuki-tour__mask--full', classNames?.mask)}
              style={styles?.mask}
              data-slot="mask"
              aria-hidden="true"
              onClick={maskClick}
            />
          ))}
        <div
          ref={mergedPanelRef}
          role="dialog"
          aria-modal={mask ? 'true' : undefined}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy ?? (ariaLabel == null && step.title != null ? titleId : undefined)}
          aria-describedby={describedBy ?? (step.description != null ? descriptionId : undefined)}
          tabIndex={-1}
          className={cx(
            'yuki-tour__popup',
            !targetEl && 'yuki-tour__popup--centered',
            step.className,
            classNames?.popup,
          )}
          style={{ ...step.style, ...panelStyle }}
          data-slot="popup"
          data-placement={targetEl ? floating.actualPlacement : 'center'}
        >
          {arrow && targetEl && (
            <span
              className={cx('yuki-tour__arrow', classNames?.arrow)}
              style={{ ...floating.arrowStyles, ...styles?.arrow }}
              data-slot="arrow"
              aria-hidden="true"
            />
          )}
          <div
            className={cx('yuki-tour__header', classNames?.header)}
            style={styles?.header}
            data-slot="header"
          >
            {step.cover != null && (
              <div className={cx('yuki-tour__cover', classNames?.cover)} style={styles?.cover} data-slot="cover">
                {step.cover}
              </div>
            )}
            {step.title != null && (
              <h2
                id={titleId}
                className={cx('yuki-tour__title', classNames?.title)}
                style={styles?.title}
                data-slot="title"
              >
                {step.title}
              </h2>
            )}
          </div>
          {step.description != null && (
            <div
              id={descriptionId}
              className={cx('yuki-tour__description', classNames?.description)}
              style={styles?.description}
              data-slot="description"
            >
              {step.description}
            </div>
          )}
          <div
            className={cx('yuki-tour__footer', classNames?.footer)}
            style={styles?.footer}
            data-slot="footer"
          >
            <span
              className={cx('yuki-tour__indicator', classNames?.indicator)}
              style={styles?.indicator}
              data-slot="indicator"
            >
              {index + 1} / {stepCount}
            </span>
            <div
              className={cx('yuki-tour__actions', classNames?.actions)}
              style={styles?.actions}
              data-slot="actions"
            >
              <Button
                className={cx('yuki-tour__skip', classNames?.skip)}
                style={styles?.skip}
                data-slot="skip"
                variant="text"
                size="sm"
                onClick={skip}
              >
                {skipText ?? t('tour.skip', { 'zh-CN': '跳过', 'en-US': 'Skip' })}
              </Button>
              <Button
                className={cx('yuki-tour__prev', classNames?.prev)}
                style={styles?.prev}
                data-slot="prev"
                variant="ghost"
                size="sm"
                disabled={index === 0}
                onClick={handlePrev}
              >
                {prevText ?? t('tour.prev', { 'zh-CN': '上一步', 'en-US': 'Previous' })}
              </Button>
              <Button
                className={cx('yuki-tour__next', classNames?.next)}
                style={styles?.next}
                data-slot="next"
                variant="solid"
                size="sm"
                onClick={handleNext}
              >
                {lastStep
                  ? finishText ?? t('tour.finish', { 'zh-CN': '完成', 'en-US': 'Finish' })
                  : nextText ?? t('tour.next', { 'zh-CN': '下一步', 'en-US': 'Next' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
    </>
  );
});

Tour.displayName = 'Tour';
