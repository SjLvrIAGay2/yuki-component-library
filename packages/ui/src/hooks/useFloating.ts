import type { StyleProperties } from '../styles/properties';
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { useIsomorphicLayoutEffect } from '../internal/useIsomorphicLayoutEffect';
import { useEventCallback } from './useEventCallback';

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Alignment = 'start' | 'center' | 'end';
export type Placement = Side | `${Side}-${Exclude<Alignment, 'center'>}`;

export interface UseFloatingOptions {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  placement?: Placement;
  /** Distance between anchor and floating element in px. */
  offset?: number;
  /** Cross-axis offset applied after alignment. */
  alignOffset?: number;
  flip?: boolean;
  shift?: boolean;
  /** Keep the floating element this far from the viewport edge. */
  viewportPadding?: number;
  /** Match the anchor exactly, or use it as a minimum when the panel fits its content. */
  matchAnchorWidth?: boolean | 'minimum';
  /** Arrow box size in px (used to compute arrow coordinates). */
  arrowSize?: number;
}

export interface UseFloatingResult {
  floatingStyles: StyleProperties;
  arrowStyles: StyleProperties;
  actualPlacement: Placement;
  isPositioned: boolean;
  /** Schedule a measurement on the next animation frame (coalesced). */
  update: () => void;
  /** Measure synchronously — useful right after a portal mounts. */
  measure: () => void;
}

interface Coords {
  x: number;
  y: number;
  placement: Placement;
  arrowX: number;
  arrowY: number;
  positioned: boolean;
  width?: number;
  minWidth?: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

const splitPlacement = (placement: Placement): { side: Side; align: Alignment } => {
  const [side, align] = placement.split('-') as [Side, Exclude<Alignment, 'center'>?];
  return { side, align: align ?? 'center' };
};

const opposite = (side: Side): Side =>
  ({ top: 'bottom', bottom: 'top', left: 'right', right: 'left' })[side] as Side;

/**
 * Minimal, dependency-free floating-position engine (fixed strategy).
 * Shared by Tooltip, Popover, Dropdown, Select, Cascader, Menu and DatePicker.
 */
export function useFloating(options: UseFloatingOptions): UseFloatingResult {
  const {
    open,
    anchorRef,
    floatingRef,
    placement = 'bottom',
    offset = 8,
    alignOffset = 0,
    flip = true,
    shift = true,
    viewportPadding = 8,
    matchAnchorWidth = false,
    arrowSize = 8,
  } = options;

  const [coords, setCoords] = useState<Coords>({
    x: 0,
    y: 0,
    placement,
    arrowX: 0,
    arrowY: 0,
    positioned: false,
  });
  const frameRef = useRef<number | null>(null);

  const compute = useEventCallback(() => {
    if (typeof window === 'undefined') return;
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!floating) return;

    const anchorRect = anchor?.getBoundingClientRect();
    if (!anchorRect) return;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minWidth = matchAnchorWidth === 'minimum'
      ? Math.min(anchorRect.width, Math.max(0, viewportWidth - 2 * viewportPadding))
      : undefined;
    const width = matchAnchorWidth === true
      ? anchorRect.width
      : Math.max(minWidth ?? 0, floating.offsetWidth);
    const height = floating.offsetHeight;

    const { side: preferredSide, align } = splitPlacement(placement);
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const anchorCenterY = anchorRect.top + anchorRect.height / 2;

    const fits = (side: Side): boolean => {
      switch (side) {
        case 'top':
          return anchorRect.top - height - offset >= viewportPadding;
        case 'bottom':
          return anchorRect.bottom + height + offset <= viewportHeight - viewportPadding;
        case 'left':
          return anchorRect.left - width - offset >= viewportPadding;
        case 'right':
          return anchorRect.right + width + offset <= viewportWidth - viewportPadding;
      }
    };

    let finalSide = preferredSide;
    if (flip && !fits(preferredSide)) {
      const other = opposite(preferredSide);
      if (fits(other)) finalSide = other;
    }

    let x = 0;
    let y = 0;
    if (finalSide === 'top' || finalSide === 'bottom') {
      y =
        finalSide === 'bottom'
          ? anchorRect.bottom + offset
          : anchorRect.top - height - offset;
      if (matchAnchorWidth === true) x = anchorRect.left;
      else if (align === 'start') x = anchorRect.left;
      else if (align === 'end') x = anchorRect.right - width;
      else x = anchorCenterX - width / 2;
      x += alignOffset;
      if (shift) x = clamp(x, viewportPadding, viewportWidth - width - viewportPadding);
    } else {
      x =
        finalSide === 'right'
          ? anchorRect.right + offset
          : anchorRect.left - width - offset;
      if (align === 'start') y = anchorRect.top;
      else if (align === 'end') y = anchorRect.bottom - height;
      else y = anchorCenterY - height / 2;
      y += alignOffset;
      if (shift) y = clamp(y, viewportPadding, viewportHeight - height - viewportPadding);
    }

    let arrowX = 0;
    let arrowY = 0;
    if (finalSide === 'top' || finalSide === 'bottom') {
      arrowX = clamp(anchorCenterX - x, arrowSize, width - arrowSize);
      arrowY = 0;
    } else {
      arrowY = clamp(anchorCenterY - y, arrowSize, height - arrowSize);
      arrowX = 0;
    }

    setCoords((prev) => {
      const finalPlacement: Placement =
        align === 'center' ? finalSide : (`${finalSide}-${align}` as Placement);
      if (
        prev.positioned &&
        Math.round(prev.x) === Math.round(x) &&
        Math.round(prev.y) === Math.round(y) &&
        prev.arrowX === arrowX && prev.arrowY === arrowY &&
        prev.width === width && prev.minWidth === minWidth && prev.placement === finalPlacement
      ) {
        return prev;
      }
      return { x, y, placement: finalPlacement, arrowX, arrowY, width, minWidth, positioned: true };
    });
  });

  const scheduleUpdate = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      compute();
    });
  }, [compute]);

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      setCoords((prev) => (prev.positioned ? { ...prev, positioned: false } : prev));
      return;
    }
    compute();
    window.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null;
    if (observer) {
      if (anchorRef.current) observer.observe(anchorRef.current);
      if (floatingRef.current) observer.observe(floatingRef.current);
    }
    return () => {
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
      observer?.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
    // Positioning must re-run when placement config changes while open.
  }, [
    open,
    compute,
    scheduleUpdate,
    anchorRef,
    floatingRef,
    placement,
    offset,
    alignOffset,
    flip,
    shift,
    viewportPadding,
    matchAnchorWidth,
    arrowSize,
  ]);

  const floatingStyles: CSSProperties = {
    position: 'fixed',
    // The entrance animation owns transform. Keep viewport coordinates independent.
    left: Math.round(coords.x),
    top: Math.round(coords.y),
    width: matchAnchorWidth === true ? coords.width : undefined,
    ...(matchAnchorWidth === 'minimum' && {
      width: 'max-content',
      minWidth: coords.minWidth,
      maxWidth: `calc(100vw - ${2 * viewportPadding}px)`,
    }),
    visibility: coords.positioned ? undefined : 'hidden',
    zIndex: 'var(--yuki-z-popover)' as unknown as number,
  };

  const arrowStyles: CSSProperties = {
    left: coords.arrowX ? `${coords.arrowX}px` : undefined,
    top: coords.arrowY ? `${coords.arrowY}px` : undefined,
  };

  return {
    floatingStyles,
    arrowStyles,
    actualPlacement: coords.placement,
    isPositioned: coords.positioned,
    update: scheduleUpdate,
    measure: compute,
  };
}
