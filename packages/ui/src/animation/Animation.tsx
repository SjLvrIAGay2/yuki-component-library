import type { WithStyle } from '../styles/properties';
import {
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import { cx } from '../internal/cx';
import { useConfig } from '../theme';
import { inertValue } from '../internal/inert';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery';

export type AnimationPreset =
  'none' | 'fade' | 'scale' | 'slide' | 'collapse' | 'feedback' | 'spin' | 'shimmer' | 'custom';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';
export interface AnimationOptions {
  preset?: AnimationPreset;
  duration?: number;
  delay?: number;
  easing?: string;
  direction?: AnimationDirection;
  distance?: number;
  scale?: number;
  /** Custom keyframe names; both must reach the final state without JS callbacks. */
  enterName?: string;
  exitName?: string;
}

export const useReducedMotion = usePrefersReducedMotion;

function finite(value: number | undefined, fallback: number) {
  return value !== undefined && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function useAnimation(
  options: AnimationOptions | false | undefined,
  fallback: AnimationPreset = 'fade',
) {
  const context = useConfig();
  const reduced = useReducedMotion();
  const configured = { ...(context.animation || {}), ...(options || {}) };
  const disabled =
    reduced ||
    !context.motion ||
    options === false ||
    (options === undefined && context.animation === false);
  const preset = disabled ? 'none' : (configured.preset ?? fallback);
  const duration =
    preset === 'none'
      ? 0
      : finite(configured.duration, preset === 'spin' ? 800 : preset === 'shimmer' ? 1400 : 180);
  const delay = preset === 'none' ? 0 : finite(configured.delay, 0);
  const distance = finite(configured.distance, 8);
  const direction = configured.direction ?? 'down';
  const style: CSSProperties & Record<`--yuki-${string}`, string | number> = {
    '--yuki-motion-duration': `${duration}ms`,
    '--yuki-motion-delay': `${delay}ms`,
    '--yuki-motion-easing': configured.easing ?? 'var(--yuki-easing-standard)',
    '--yuki-motion-x': `${direction === 'left' ? -distance : direction === 'right' ? distance : 0}px`,
    '--yuki-motion-y': `${direction === 'up' ? -distance : direction === 'down' ? distance : 0}px`,
    '--yuki-motion-scale': Number.isFinite(configured.scale) ? configured.scale! : 0.96,
    ...(configured.enterName ? { '--yuki-motion-enter': configured.enterName } : {}),
    ...(configured.exitName ? { '--yuki-motion-exit': configured.exitName } : {}),
  };
  return {
    className: 'yuki-motion',
    style,
    'data-yuki-motion-preset': preset,
    'data-yuki-direction': direction,
    'data-yuki-presence': ['fade', 'scale', 'slide', 'collapse', 'custom'].includes(fallback)
      ? ''
      : undefined,
    duration,
    delay,
  } as const;
}

/** A bounded timer is a fallback even when animation events are cancelled or unavailable. */
export function usePresence(open: boolean, duration: number, delay = 0) {
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    if (duration + delay === 0) {
      setPresent(false);
      return;
    }
    const timer = window.setTimeout(() => setPresent(false), Math.min(duration + delay, 60_000));
    return () => window.clearTimeout(timer);
  }, [open, duration, delay]);
  return open || present;
}

export interface AnimationProps extends WithStyle<HTMLAttributes<HTMLDivElement>> {
  animation?: AnimationOptions | false;
  open?: boolean;
  forceMount?: boolean;
}
export const Animation = forwardRef<HTMLDivElement, AnimationProps>(function Animation(
  { animation, open = true, forceMount, className, style, children, ...props },
  ref,
) {
  const { duration, delay, ...motion } = useAnimation(animation);
  const present = usePresence(open, duration, delay);
  if (!present && !forceMount) return null;
  return (
    <div
      {...props}
      {...motion}
      ref={ref}
      className={cx(motion.className, className)}
      style={{ ...motion.style, ...style }}
      data-state={open ? 'open' : 'closed'}
      hidden={props.hidden || (!open && forceMount)}
      aria-hidden={!open ? true : props['aria-hidden']}
      inert={inertValue(!open || props.inert)}
    >
      {children}
    </div>
  );
});
