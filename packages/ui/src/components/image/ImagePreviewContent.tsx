import type { StyleProperties } from '../../styles/properties';
import { useIsomorphicLayoutEffect } from '../../internal/useIsomorphicLayoutEffect';
import { useEffect, useRef, useState } from 'react';
import { useResizeObserver } from '../../hooks';
import { cx } from '../../internal/cx';
import { useLocale } from '../../theme';
import { Button, IconButton } from '../button';
import { Icon } from '../icon';

const levels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const fitIndex = levels.indexOf(1);

interface PreviewContentProps {
  src?: string;
  alt: string;
  className?: string;
  style?: StyleProperties;
  onBackdropClick: () => void;
}

export function ImagePreviewContent({
  src,
  alt,
  className,
  style,
  onBackdropClick,
}: PreviewContentProps) {
  const { t } = useLocale();
  const viewport = useRef<HTMLDivElement>(null);
  const box = useResizeObserver(viewport);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [index, setIndex] = useState(fitIndex);
  const zoom = levels[index] ?? 1;
  const fit =
    natural.width && natural.height && box.width && box.height
      ? Math.min(1, box.width / natural.width, box.height / natural.height)
      : 0;
  const width = natural.width * fit * zoom;
  const height = natural.height * fit * zoom;
  const center = useRef({ x: 0.5, y: 0.5 });
  const changeZoom = (next: number) => {
    const area = viewport.current;
    if (area) {
      center.current = {
        x: (area.scrollLeft + area.clientWidth / 2) / (area.scrollWidth || 1),
        y: (area.scrollTop + area.clientHeight / 2) / (area.scrollHeight || 1),
      };
    }
    setIndex(Math.max(0, Math.min(levels.length - 1, next)));
  };

  useIsomorphicLayoutEffect(() => {
    const area = viewport.current;
    if (!area) return;
    area.scrollLeft = center.current.x * area.scrollWidth - area.clientWidth / 2;
    area.scrollTop = center.current.y * area.scrollHeight - area.clientHeight / 2;
  }, [index]);

  useEffect(() => {
    const area = viewport.current;
    if (!area) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey || event.deltaY === 0) return;
      event.preventDefault();
      changeZoom(index + (event.deltaY < 0 ? 1 : -1));
    };
    area.addEventListener('wheel', wheel, { passive: false });
    return () => area.removeEventListener('wheel', wheel);
  }, [index]);

  return (
    <>
      <div
        ref={viewport}
        className="yuki-image-preview__viewport"
        data-slot="preview-viewport"
        tabIndex={0}
        aria-label={t('image.previewLabel', { 'zh-CN': '图片预览', en: 'Image preview' })}
        onClick={(event) => {
          if (event.target === event.currentTarget) onBackdropClick();
        }}
        onKeyDown={(event) => {
          if (event.key === '+' || event.key === '=') changeZoom(index + 1);
          else if (event.key === '-') changeZoom(index - 1);
          else if (event.key === '0') changeZoom(fitIndex);
          else return;
          event.preventDefault();
        }}
      >
        <img
          data-slot="preview-image"
          src={src}
          alt={alt}
          className={cx('yuki-image-preview__img', className)}
          style={{
            ...(fit ? { width, height, maxWidth: 'none', maxHeight: 'none' } : {}),
            ...style,
          }}
          draggable={false}
          onLoad={(event) => {
            const img = event.currentTarget;
            setNatural({ width: img.naturalWidth, height: img.naturalHeight });
          }}
        />
      </div>
      <div
        className="yuki-image-preview__tools"
        role="group"
        aria-label={t('image.zoom', { 'zh-CN': '图片缩放', en: 'Image zoom' })}
      >
        <IconButton
          size="sm"
          tone="neutral"
          icon={<Icon name="zoom-out" />}
          disabled={index === 0}
          aria-label={t('image.zoomOut', { 'zh-CN': '缩小图片', en: 'Zoom out' })}
          onClick={() => changeZoom(index - 1)}
        />
        <Button
          size="sm"
          variant="ghost"
          tone="neutral"
          aria-label={t('image.resetZoom', { 'zh-CN': '重置缩放', en: 'Reset zoom' })}
          onClick={() => changeZoom(fitIndex)}
        >
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
        </Button>
        <IconButton
          size="sm"
          tone="neutral"
          icon={<Icon name="zoom-in" />}
          disabled={index === levels.length - 1}
          aria-label={t('image.zoomIn', { 'zh-CN': '放大图片', en: 'Zoom in' })}
          onClick={() => changeZoom(index + 1)}
        />
      </div>
    </>
  );
}
