import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useControllableState, useMergedRefs } from '../../hooks';
import { useComponentDefaults, useConfig } from '../../theme';

export type SplitterDirection = 'horizontal' | 'vertical';

export interface SplitterClassNames {
  root?: string;
  pane?: string;
  firstPane?: string;
  secondPane?: string;
  handle?: string;
  line?: string;
}

export interface SplitterStyles {
  root?: CSSProperties;
  pane?: CSSProperties;
  firstPane?: CSSProperties;
  secondPane?: CSSProperties;
  handle?: CSSProperties;
  line?: CSSProperties;
}

export interface SplitterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** `horizontal` places panes side by side, `vertical` stacks them. */
  direction?: SplitterDirection;
  /** Controlled size of the first pane, in percent. */
  size?: number;
  /** Uncontrolled initial size of the first pane, in percent. */
  defaultSize?: number;
  /** Lower bound in percent. */
  min?: number;
  /** Upper bound in percent. */
  max?: number;
  /** Percent moved per arrow-key press. */
  step?: number;
  disabled?: boolean;
  onResize?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
  /** Replaces the default grip line inside the handle. */
  handle?: ReactNode;
  classNames?: SplitterClassNames;
  styles?: SplitterStyles;
  children?: [ReactNode, ReactNode];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Two resizable panes with pointer and keyboard resizing. */
export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(function Splitter(
  inputProps,
  ref,
) {
  const {
    direction = 'horizontal',
    size,
    defaultSize = 50,
    min = 10,
    max = 90,
    step = 1,
    disabled = false,
    onResize,
    onResizeEnd,
    handle,
    classNames,
    styles,
    className,
    style,
    children,
    onPointerDown,
    onKeyDown,
    ...rest
  } = useComponentDefaults('Splitter', inputProps);
  const { t } = useConfig();
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  const dragRef = useRef<{ position: number; size: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const [requestedSize, setSize] = useControllableState<number>({
    value: size,
    defaultValue: defaultSize,
    onChange: onResize,
  });
  const currentSize = clamp(requestedSize, min, max);
  const sizeRef = useRef(currentSize);
  sizeRef.current = currentSize;

  const commit = useCallback(
    (next: number) => {
      setSize(clamp(next, min, max));
    },
    [max, min, setSize],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (disabled || event.button !== 0 || event.defaultPrevented) return;
      event.preventDefault();
      dragRef.current = {
        position: direction === 'horizontal' ? event.clientX : event.clientY,
        size: sizeRef.current,
      };
      setDragging(true);
    },
    [direction, disabled, onPointerDown],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (disabled || event.defaultPrevented) return;
      const increaseKey = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const decreaseKey = direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      if (event.key === increaseKey) {
        event.preventDefault();
        commit(sizeRef.current + step);
      } else if (event.key === decreaseKey) {
        event.preventDefault();
        commit(sizeRef.current - step);
      } else if (event.key === 'Home') {
        event.preventDefault();
        commit(min);
      } else if (event.key === 'End') {
        event.preventDefault();
        commit(max);
      }
    },
    [commit, direction, disabled, max, min, onKeyDown, step],
  );

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      const root = rootRef.current;
      if (!drag || !root) return;
      const rect = root.getBoundingClientRect();
      const total = direction === 'horizontal' ? rect.width : rect.height;
      if (!total) return;
      const position = direction === 'horizontal' ? event.clientX : event.clientY;
      commit(drag.size + ((position - drag.position) / total) * 100);
    };
    const handleEnd = () => {
      dragRef.current = null;
      setDragging(false);
      onResizeEnd?.(sizeRef.current);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [commit, direction, dragging, onResizeEnd]);

  const [first, second] = children ?? [];
  const separatorOrientation = direction === 'horizontal' ? 'vertical' : 'horizontal';

  return (
    <div
      ref={mergedRef}
      {...rest}
      data-slot="splitter"
      data-direction={direction}
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      className={cx(
        'yuki-splitter',
        `yuki-splitter--${direction}`,
        disabled && 'yuki-splitter--disabled',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      <div
        data-slot="pane"
        data-pane="first"
        className={cx('yuki-splitter__pane', classNames?.pane, classNames?.firstPane)}
        style={
          {
            flexBasis: `${currentSize}%`,
            ...styles?.pane,
            ...styles?.firstPane,
          } as CSSProperties
        }
      >
        {first}
      </div>
      <div
        role="separator"
        aria-orientation={separatorOrientation}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(currentSize)}
        aria-label={t('splitter.resize')}
        tabIndex={disabled ? -1 : 0}
        data-slot="handle"
        className={cx('yuki-splitter__handle', classNames?.handle)}
        style={styles?.handle}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      >
        {handle ?? (
          <span
            aria-hidden="true"
            data-slot="line"
            className={cx('yuki-splitter__line', classNames?.line)}
            style={styles?.line}
          />
        )}
      </div>
      <div
        data-slot="pane"
        data-pane="second"
        className={cx(
          'yuki-splitter__pane',
          'yuki-splitter__pane--fill',
          classNames?.pane,
          classNames?.secondPane,
        )}
        style={{ ...styles?.pane, ...styles?.secondPane }}
      >
        {second}
      </div>
    </div>
  );
});

Splitter.displayName = 'Splitter';
