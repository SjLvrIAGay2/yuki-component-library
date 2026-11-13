import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { Icon } from '../icon/Icon';
import { useComponentDefaults, useLocale } from '../../theme';
import { encodeQRCode, type QRCodeErrorLevel } from './qr-encode';

export type { QRCodeErrorLevel };

export type QRCodeStatus = 'active' | 'loading' | 'expired';

export interface QRCodeClassNames {
  root?: string;
  canvas?: string;
  logo?: string;
  status?: string;
  refresh?: string;
}

export interface QRCodeStyles {
  root?: CSSProperties;
  canvas?: CSSProperties;
  logo?: CSSProperties;
  status?: CSSProperties;
  refresh?: CSSProperties;
}

export interface QRCodeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'children'> {
  /** 需要编码的文本（UTF-8）。 */
  value: string;
  /** 二维码像素尺寸，默认 160。 */
  size?: number;
  /** 纠错等级，默认 `M`；等级越高可容纳内容越少。 */
  level?: QRCodeErrorLevel;
  /** 深色模块颜色，默认使用组件 token。 */
  color?: string;
  /** 浅色背景颜色，默认使用组件 token。 */
  bgColor?: string;
  /** 是否带内边距与描边。 */
  bordered?: boolean;
  /** 状态；`expired` 时展示刷新入口。 */
  status?: QRCodeStatus;
  /** 自定义非激活状态的覆盖内容。 */
  statusRender?: (status: 'loading' | 'expired') => ReactNode;
  /** 点击刷新回调。 */
  onRefresh?: () => void;
  /** 中心图标 / Logo。 */
  icon?: ReactNode;
  /** 自定义可访问名称，默认“二维码”。 */
  ariaLabel?: string;
  label?: string;
  /** Quiet-zone width in QR modules. */
  marginSize?: number;
  classNames?: QRCodeClassNames;
  styles?: QRCodeStyles;
}

function toPath(modules: boolean[][]): string {
  const parts: string[] = [];
  for (let y = 0; y < modules.length; y++) {
    const row = modules[y] ?? [];
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x++;
        continue;
      }
      const start = x;
      while (x < row.length && row[x]) x++;
      parts.push(`M${start} ${y}h${x - start}v1h${start - x}z`);
    }
  }
  return parts.join('');
}

/**
 * 二维码。内置无依赖编码器（数字 / 字母数字 / Byte 模式，版本 1–40），使用 SVG 渲染，
 * 支持加载 / 过期状态覆盖与中心 Logo。
 */
export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  inputProps,
  ref,
) {
  const props = useComponentDefaults('QRCode', inputProps);
  const {
    value,
    size = 160,
    level = 'M',
    color,
    bgColor,
    bordered = false,
    status = 'active',
    statusRender,
    onRefresh,
    icon,
    label: labelProp, ariaLabel, marginSize = 0,
    className,
    style,
    classNames,
    styles,
    ...rest
  } = props;

  const { t } = useLocale();

  const matrix = useMemo(() => {
    try {
      return encodeQRCode(value, level);
    } catch {
      return null;
    }
  }, [value, level]);

  const path = useMemo(
    () => (matrix ? toPath(matrix.modules) : ''),
    [matrix],
  );

  const label =
    ariaLabel ?? labelProp ?? rest['aria-label'] ?? t('qrcode.label', { 'zh-CN': '二维码', en: 'QR code' });
  const margin = Number.isFinite(marginSize) ? Math.max(0, Math.floor(marginSize)) : 0;
  const inactive = status !== 'active';
  const statusContent = inactive
    ? statusRender?.(status)
    : undefined;

  return (
    <div
      {...rest}
      ref={ref}
      data-slot="qrcode"
      data-level={level}
      data-status={status}
      data-bordered={bordered || undefined}
      data-error={matrix ? undefined : true}
      role="img"
      aria-label={label}
      aria-busy={status === 'loading' || undefined}
      className={cx(
        'yuki-qrcode',
        bordered && 'yuki-qrcode--bordered',
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {matrix ? (
        <svg
          data-slot="canvas"
          className={cx('yuki-qrcode__canvas', classNames?.canvas)}
          style={styles?.canvas}
          viewBox={`${-margin} ${-margin} ${matrix.size + margin * 2} ${matrix.size + margin * 2}`}
          width={size}
          height={size}
          shapeRendering="crispEdges"
          focusable="false"
          aria-hidden="true"
        >
          <rect
            x={-margin} y={-margin}
            width={matrix.size + margin * 2}
            height={matrix.size + margin * 2}
            fill={bgColor ?? 'var(--yuki-qrcode-bg)'}
          />
          <path d={path} fill={color ?? 'var(--yuki-qrcode-fg)'} />
        </svg>
      ) : (
        <span className="yuki-qrcode__error" aria-hidden="true">
          <Icon name="alert-triangle" />
        </span>
      )}

      {icon ? (
        <span
          data-slot="logo"
          className={cx('yuki-qrcode__logo', classNames?.logo)}
          style={styles?.logo}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}

      {inactive ? (
        <div
          data-slot="status"
          className={cx('yuki-qrcode__status', classNames?.status)}
          style={styles?.status}
        >
          {statusContent ?? (
            <>
              <span className="yuki-qrcode__status-text">
                {status === 'loading'
                  ? t('qrcode.loading', { 'zh-CN': '生成中…', en: 'Generating…' })
                  : t('qrcode.expired', { 'zh-CN': '二维码已失效', en: 'QR code expired' })}
              </span>
              {status === 'loading' ? (
                <Icon name="loader" spin className="yuki-qrcode__spinner" />
              ) : (
                <button
                  type="button"
                  data-slot="refresh"
                  className={cx('yuki-qrcode__refresh', classNames?.refresh)}
                  style={styles?.refresh}
                  onClick={onRefresh}
                >
                  <Icon name="refresh" />
                  {t('qrcode.refresh', { 'zh-CN': '刷新', en: 'Refresh' })}
                </button>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
});

QRCode.displayName = 'QRCode';
