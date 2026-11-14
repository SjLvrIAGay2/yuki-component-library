import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Portal } from '../../internal/Portal';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useLocale } from '../../theme';

export type SpinSize = 'sm' | 'md' | 'lg';

export interface SpinClassNames {
  root?: string;
  content?: string;
  mask?: string;
  indicator?: string;
  tip?: string;
}

export interface SpinStyles {
  root?: StyleProperties;
  content?: StyleProperties;
  mask?: StyleProperties;
  indicator?: StyleProperties;
  tip?: StyleProperties;
}

export interface SpinProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'children'> {
  /** Whether the loading indicator is shown. @default true */
  spinning?: boolean;
  /** Indicator size. @default 'md' */
  size?: SpinSize;
  /** Caption below the indicator. */
  tip?: ReactNode;
  /** Milliseconds to wait before showing the indicator, avoiding flashes. @default 0 */
  delay?: number;
  /** Cover the whole viewport. Only applies without `children`. */
  fullscreen?: boolean;
  /** Replace the built-in ring indicator. */
  icon?: ReactNode;
  /** Accessible status label; defaults to `tip` (when a string) or the loading copy. */
  label?: string;
  /** Content that the loading mask covers. */
  children?: ReactNode;
  classNames?: SpinClassNames;
  styles?: SpinStyles;
}

export const Spin = forwardRef<HTMLDivElement, SpinProps>(function Spin(inputProps, ref) {
  const props = useComponentDefaults('Spin', inputProps);
  const {
    spinning = true,
    size = 'md',
    tip,
    delay = 0,
    fullscreen = false,
    icon,
    label,
    children,
    classNames,
    styles,
    className,
    style,
    role,
    ...rest
  } = props;
  const { t } = useLocale();
  const [visible, setVisible] = useState(spinning && delay <= 0);

  useEffect(() => {
    if (!spinning) {
      setVisible(false);
      return;
    }
    if (delay <= 0) {
      setVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [spinning, delay]);

  const labelText =
    label ?? (typeof tip === 'string' ? tip : t('common.loading', { 'zh-CN': '加载中', 'en-US': 'Loading' }));

  const indicator = (
    <span
      className={cx('yuki-spin__indicator', classNames?.indicator)}
      style={styles?.indicator}
      data-slot="indicator"
      aria-hidden="true"
    >
      {icon ?? <span className="yuki-spin__ring" data-slot="ring" />}
    </span>
  );

  const indicatorWrap = (
    <span className="yuki-spin__indicator-wrap" data-slot="indicator-wrap">
      {indicator}
      {tip != null && (
        <span className={cx('yuki-spin__tip', classNames?.tip)} style={styles?.tip} data-slot="tip">
          {tip}
        </span>
      )}
    </span>
  );

  if (children == null) {
    if (!visible) return null;
    const standalone = (
      <div
        {...rest}
        ref={ref}
        role={role ?? 'status'}
        aria-live="polite"
        aria-label={labelText}
        className={cx(
          'yuki-spin',
          'yuki-spin--standalone',
          fullscreen && 'yuki-spin--fullscreen',
          classNames?.root,
          className,
        )}
        style={{ ...style, ...styles?.root }}
        data-slot="root"
        data-size={size}
        data-spinning="true"
      >
        {indicatorWrap}
      </div>
    );
    return fullscreen ? <Portal>{standalone}</Portal> : standalone;
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('yuki-spin', 'yuki-spin--nested', classNames?.root, className)}
      style={{ ...style, ...styles?.root }}
      data-slot="root"
      data-size={size}
      data-spinning={visible ? 'true' : 'false'}
      aria-busy={visible || undefined}
    >
      <div className={cx('yuki-spin__content', classNames?.content)} style={styles?.content} data-slot="content">
        {children}
      </div>
      {visible && (
        <div className={cx('yuki-spin__mask', classNames?.mask)} style={styles?.mask} data-slot="mask">
          <span className="yuki-spin__status" role="status" aria-live="polite" aria-label={labelText}>
            {indicatorWrap}
          </span>
        </div>
      )}
    </div>
  );
});

Spin.displayName = 'Spin';
