import { forwardRef, type SVGProps } from 'react';
import { cx } from '../../internal/cx';
import type { WithStyle } from '../../styles/properties';

export interface SparklineProps extends Omit<WithStyle<SVGProps<SVGSVGElement>>, 'values' | 'children'> {
  /** Null and non-finite samples leave a break in the line. */
  values: readonly (number | null)[];
  label?: string;
}

/** An inline trend chart. Supply a label when it conveys information beyond nearby text. */
export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(function Sparkline({
  values, label, className, 'aria-label': ariaLabel = label, 'aria-labelledby': labelledBy, ...rest
}, ref) {
  let min = Infinity, max = -Infinity;
  for (const value of values) {
    if (value !== null && Number.isFinite(value)) { min = Math.min(min, value); max = Math.max(max, value); }
  }
  const segments: string[][] = [];
  let segment: string[] | undefined;
  values.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) { segment = undefined; return; }
    if (!segment) { segment = []; segments.push(segment); }
    const x = values.length === 1 ? 50 : 1 + 98 * index / (values.length - 1);
    const extent = max - min;
    const fraction = max === min ? 0.5 : Number.isFinite(extent)
      ? (value - min) / extent
      : (value / 2 - min / 2) / (max / 2 - min / 2);
    const y = 29 - 28 * fraction;
    segment.push(x + ',' + y);
  });
  const named = Boolean(ariaLabel || labelledBy);
  return <svg ref={ref} viewBox="0 0 100 30" preserveAspectRatio="none" focusable="false"
    role={named ? 'img' : undefined} aria-hidden={named ? undefined : true}
    aria-label={ariaLabel} aria-labelledby={labelledBy} className={cx('yuki-sparkline', className)} {...rest}>
    {segments.map((points, i) => points.length === 1
      ? <circle key={i} cx={points[0]!.split(',')[0]} cy={points[0]!.split(',')[1]} r="1.5" fill="currentColor" />
      : <polyline key={i} points={points.join(' ')} fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}
  </svg>;
});
