import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react';
import { useControllableState } from '../../hooks';
import { cx } from '../../internal/cx';
import { useLocale } from '../../theme';
import type { WithStyle } from '../../styles/properties';

export interface ComparisonImage extends Pick<ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'sizes' | 'loading'> {
  src: string;
  alt: string;
}

export interface ImageComparisonProps extends Omit<WithStyle<HTMLAttributes<HTMLElement>>, 'children' | 'onChange'> {
  before: ComparisonImage;
  after: ComparisonImage;
  value?: number;
  defaultValue?: number;
  onChange?: (percent: number) => void;
  label?: string;
  caption?: ReactNode;
}

export const ImageComparison = forwardRef<HTMLElement, ImageComparisonProps>(function ImageComparison({
  before, after, value, defaultValue = 50, onChange, label, caption, className, ...props
}, ref) {
  const { t } = useLocale();
  const [position, setPosition] = useControllableState({ value, defaultValue, onChange });
  const percent = Number.isFinite(position) ? Math.min(100, Math.max(0, position)) : 50;
  return <figure ref={ref} className={cx('yuki-image-comparison', className)} {...props}>
    <div className="yuki-image-comparison__frame" dir="ltr">
      <img className="yuki-image-comparison__image" {...after} />
      <img className="yuki-image-comparison__before" {...before} style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }} />
      <span className="yuki-image-comparison__divider" aria-hidden="true" style={{left: percent + '%'}} />
      <input className="yuki-image-comparison__range" type="range" min={0} max={100} value={percent}
        aria-label={label ?? t('imageCompare')} aria-valuetext={t('imageCompareValue', undefined, { percent })}
        onChange={event => setPosition(event.currentTarget.valueAsNumber)} />
    </div>
    {caption != null && <figcaption>{caption}</figcaption>}
  </figure>;
});
