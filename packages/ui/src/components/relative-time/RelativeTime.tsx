import { forwardRef, useEffect, useState, type TimeHTMLAttributes } from 'react';
import { useLocale } from '../../theme';
import type { WithStyle } from '../../styles/properties';

export interface RelativeTimeProps extends Omit<WithStyle<TimeHTMLAttributes<HTMLTimeElement>>, 'children' | 'dateTime'> {
  value: Date | number | string;
  /** Fixed reference time in epoch milliseconds for reports and deterministic rendering. */
  now?: number;
  numeric?: Intl.RelativeTimeFormatNumeric;
}

const units: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400],
  ['hour', 3600], ['minute', 60], ['second', 1],
];

export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(function RelativeTime({
  value, now, numeric = 'auto', title, ...props
}, ref) {
  const { locale } = useLocale();
  const date = value instanceof Date ? value : new Date(value);
  const timestamp = date.getTime();
  const [clock, setClock] = useState<number>();
  const reference = now ?? clock;
  const seconds = (timestamp - (reference ?? timestamp)) / 1000;
  const [unit, duration] = units.find(([, size]) => Math.abs(seconds) >= size) ?? units[units.length - 1]!;
  const amount = Math.round(seconds / duration) || 0;
  useEffect(() => {
    if (now !== undefined || !Number.isFinite(timestamp)) return;
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      const current = Date.now();
      setClock(current);
      const distance = (timestamp - current) / 1000;
      const [, step] = units.find(([, size]) => Math.abs(distance) >= size) ?? units[units.length - 1]!;
      const nextRounding = distance - (Math.round(distance / step) - 0.5) * step;
      const nextUnit = distance > 0 && step > 1 ? distance - step : Infinity;
      const larger = units.filter(([, size]) => size > step).at(-1)?.[1] ?? Infinity;
      const until = Math.min(nextRounding, nextUnit, distance <= 0 ? larger + distance : Infinity);
      timer = setTimeout(update, Math.max(40, Math.min(86400000, until * 1000 + 15)));
    };
    update();
    return () => clearTimeout(timer);
  }, [now, timestamp]);
  if (!Number.isFinite(timestamp)) return <time {...props} ref={ref} title={title}>—</time>;
  const absolute = date.toISOString();
  return <time {...props} ref={ref} dateTime={absolute} title={title ?? absolute}>
    {reference === undefined || !Number.isFinite(reference) ? absolute : new Intl.RelativeTimeFormat(locale.name, { numeric }).format(amount, unit)}
  </time>;
});
