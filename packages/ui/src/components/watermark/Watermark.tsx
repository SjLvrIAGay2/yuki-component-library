import { useComponentDefaults } from '../../theme';
import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';

export interface WatermarkClassNames {
  root?: string;
  canvas?: string;
  content?: string;
}

export interface WatermarkStyles {
  root?: CSSProperties;
  canvas?: CSSProperties;
  content?: CSSProperties;
}

export interface WatermarkProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Text lines painted in the repeated pattern. */
  content?: string | string[];
  text?: string;
  /** Image source (URL or data URI) used instead of the text. */
  image?: string;
  /** Width of one watermark tile (px). */
  width?: number;
  /** Height of one watermark tile (px). */
  height?: number;
  /** Rotation of the pattern in degrees. */
  rotate?: number;
  /** Horizontal / vertical spacing between tiles (px). */
  gap?: [number, number];
  /** Base offset of the pattern (px). */
  offset?: [number, number];
  /** Pattern opacity from 0 to 1. */
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
  /** Text/pattern color; defaults to the inherited text color. */
  color?: string;
  zIndex?: number;
  children?: ReactNode;
  classNames?: WatermarkClassNames;
  styles?: WatermarkStyles;
}

/**
 * Renders children with a repeated canvas watermark overlay. The pattern is
 * repainted whenever the container is resized (ResizeObserver) or a prop
 * changes.
 */
export const Watermark = forwardRef<HTMLDivElement, WatermarkProps>(function Watermark(
  inputProps,
  ref,
) {
  const {
    text,
    content = text,
    image,
    width = 120,
    height = 64,
    rotate = -22,
    gap = [100, 100],
    offset = [0, 0],
    opacity = 0.15,
    fontSize = 14,
    fontFamily,
    color,
    zIndex = 9,
    children,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Watermark', inputProps);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const lines = (Array.isArray(content) ? content : content ? [content] : []).filter(Boolean);
    const gapX = gap[0] ?? 0;
    const gapY = gap[1] ?? 0;

    let lastPaint = 0;
    const paint = (boxWidth: number, boxHeight: number) => {
      const revision = ++lastPaint;
      const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
      const tileWidth = Math.max(1, width + gapX);
      const tileHeight = Math.max(1, height + gapY);

      canvas.width = Math.max(1, Math.round(boxWidth * dpr));
      canvas.height = Math.max(1, Math.round(boxHeight * dpr));
      canvas.style.width = `${boxWidth}px`;
      canvas.style.height = `${boxHeight}px`;
      canvas.style.opacity = String(opacity);
      canvas.style.zIndex = String(zIndex);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const mainCtx = ctx;

      const tile = document.createElement('canvas');
      tile.width = Math.round(tileWidth * dpr);
      tile.height = Math.round(tileHeight * dpr);
      const tileCtx = tile.getContext('2d');
      if (!tileCtx) return;
      tileCtx.scale(dpr, dpr);
      tileCtx.translate(tileWidth / 2, tileHeight / 2);
      tileCtx.rotate((rotate * Math.PI) / 180);
      const resolvedColor =
        color ??
        (typeof window === 'undefined' ? 'currentColor' : getComputedStyle(root).color || 'currentColor');

      if (image) {
        const img = new Image();
        img.onload = () => {
          if (lastPaint !== revision) return;
          tileCtx.clearRect(-tileWidth, -tileHeight, tileWidth * 2, tileHeight * 2);
          tileCtx.drawImage(img, -width / 2, -height / 2, width, height);
          paintPattern();
        };
        img.src = image;
        return;
      }

      tileCtx.fillStyle = resolvedColor;
      tileCtx.font = `${fontSize}px ${fontFamily ?? 'sans-serif'}`;
      tileCtx.textAlign = 'center';
      tileCtx.textBaseline = 'middle';
      const lineHeight = fontSize * 1.4;
      const startY = -((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => {
        tileCtx.fillText(line, 0, startY + index * lineHeight);
      });
      paintPattern();

      function paintPattern() {
        mainCtx.clearRect(0, 0, mainCtx.canvas.width, mainCtx.canvas.height);
        mainCtx.globalAlpha = 1;
        mainCtx.save();
        mainCtx.translate((offset[0] ?? 0) * dpr, (offset[1] ?? 0) * dpr);
        const pattern = mainCtx.createPattern(tile, 'repeat');
        if (pattern) {
          mainCtx.fillStyle = pattern;
          mainCtx.fillRect(-(offset[0] ?? 0) * dpr, -(offset[1] ?? 0) * dpr, mainCtx.canvas.width, mainCtx.canvas.height);
        }
        mainCtx.restore();
      }
    };

    const initialWidth = root.clientWidth || root.offsetWidth || 0;
    const initialHeight = root.clientHeight || root.offsetHeight || 0;
    if (initialWidth > 0 && initialHeight > 0) paint(initialWidth, initialHeight);

    const ro =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const box = entry.contentRect;
            if (box.width > 0 && box.height > 0) paint(box.width, box.height);
          });
    ro?.observe(root);
    return () => { lastPaint++; ro?.disconnect(); };
  }, [color, content, fontFamily, fontSize, gap, height, image, offset, opacity, rotate, width, zIndex]);

  return (
    <div
      {...rest}
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cx('yuki-watermark', classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-slot="watermark"
    >
      <div className={cx('yuki-watermark__content', classNames?.content)} style={styles?.content} data-slot="watermark-content">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        className={cx('yuki-watermark__canvas', classNames?.canvas)}
        style={styles?.canvas}
        data-slot="watermark-canvas"
        aria-hidden="true"
      />
    </div>
  );
});

Watermark.displayName = 'Watermark';
