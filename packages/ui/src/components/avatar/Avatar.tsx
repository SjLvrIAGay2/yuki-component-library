import {
  Children,
  forwardRef,
  useEffect,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Icon } from '../icon/Icon';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useLocale, type Size } from '../../theme';

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = number | Size;

export interface AvatarClassNames {
  root?: string;
  image?: string;
  fallback?: string;
}

export interface AvatarStyles {
  root?: CSSProperties;
  image?: CSSProperties;
  fallback?: CSSProperties;
}

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** 图片地址。 */
  src?: string;
  status?: 'online' | 'offline' | 'busy';
  statusLabel?: string;
  imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'children'>;
  fallbackProps?: HTMLAttributes<HTMLSpanElement>;
  statusProps?: HTMLAttributes<HTMLSpanElement>;
  /** 响应式图片地址。 */
  srcSet?: string;
  /** 图片替代文本，缺失时视为装饰图。 */
  alt?: string;
  /** 大小：数字为像素，或使用尺寸档位。 */
  size?: AvatarSize;
  /** 形状。 */
  shape?: AvatarShape;
  /** 自定义图标，优先级低于 fallback/children。 */
  icon?: ReactNode;
  /** 图片加载失败时展示的内容。 */
  fallback?: ReactNode;
  /** 完全自定义内容，优先于图片。 */
  children?: ReactNode;
  /** 图片加载完成回调。 */
  onImageLoad?: ImgHTMLAttributes<HTMLImageElement>['onLoad'];
  /** 图片加载失败回调。 */
  onImageError?: ImgHTMLAttributes<HTMLImageElement>['onError'];
  /** 图片元素的额外属性。 */
  imgProps?: Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'srcSet' | 'alt' | 'onLoad' | 'onError'
  >;
  classNames?: AvatarClassNames;
  styles?: AvatarStyles;
}

type ImageStatus = 'loading' | 'loaded' | 'error';

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  inputProps,
  ref,
) {
  const {
    src,
    srcSet,
    status: presence,
    statusLabel,
    alt,
    size = 'md',
    shape = 'circle',
    icon,
    fallback,
    children,
    onImageLoad,
    onImageError,
    imgProps, imageProps, fallbackProps, statusProps,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Avatar', inputProps);
  const { t } = useLocale();
  const [status, setStatus] = useState<ImageStatus>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  const showImage = children == null && Boolean(src) && status !== 'error';

  const fallbackContent =
    children ??
    fallback ??
    icon ??
    (alt ? alt.slice(0, 1).toUpperCase() : <Icon name="user" size="50%" />);

  const sizeStyle =
    typeof size === 'number'
      ? { width: size, height: size }
      : null;

  const presenceNames = { online: '在线', offline: '离线', busy: '忙碌' };
  const presenceLabel = presence && (statusLabel ?? t(`avatar.${presence}`, { zh: presenceNames[presence], en: presence }));
  const label = rest['aria-label'] ?? (presenceLabel ? [alt, presenceLabel].filter(Boolean).join(', ') : !showImage && alt ? alt : undefined);

  return (
    <span
      ref={ref}
      {...rest}
      data-slot="avatar"
      data-size={typeof size === 'number' ? undefined : size}
      data-shape={shape}
      data-presence={presence}
      data-status={src ? status : 'empty'}
      role={rest.role ?? (label ? 'img' : undefined)}
      aria-label={label}
      className={cx(
        'yuki-avatar',
        typeof size === 'string' && `yuki-avatar--${size}`,
        `yuki-avatar--${shape}`,
        classNames?.root,
        className,
      )}
      style={{ ...sizeStyle, ...styles?.root, ...style }}
    >
      <span
        {...fallbackProps}
        data-slot="fallback"
        aria-hidden={showImage || alt ? true : undefined}
        className={cx('yuki-avatar__fallback', classNames?.fallback, fallbackProps?.className)}
        style={{ ...styles?.fallback, ...fallbackProps?.style }}
      >
        {fallbackContent}
      </span>
      {src && children == null ? (
        <img
          data-slot="image"
          {...imageProps}
          {...imgProps}
          className={cx('yuki-avatar__image', classNames?.image, imageProps?.className, imgProps?.className)}
          style={{ ...styles?.image, ...imageProps?.style, ...imgProps?.style }}
          src={src}
          srcSet={srcSet ?? imageProps?.srcSet}
          alt={alt ?? ''}
          aria-hidden={alt ? undefined : true}
          onLoad={(event) => {
            imageProps?.onLoad?.(event);
            setStatus('loaded');
            onImageLoad?.(event);
          }}
          onError={(event) => {
            imageProps?.onError?.(event);
            if (!event.defaultPrevented) setStatus('error');
            onImageError?.(event);
          }}
        />
      ) : null}
      {presence && <span {...statusProps} aria-hidden="true" data-slot="status" data-status={presence}
        className={cx('yuki-avatar__presence', statusProps?.className)} />}
    </span>
  );
});

Avatar.displayName = 'Avatar';

export interface AvatarGroupClassNames {
  root?: string;
  overflow?: string;
}

export interface AvatarGroupStyles {
  root?: CSSProperties;
  overflow?: CSSProperties;
}

export interface AvatarGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 头像列表。 */
  children?: ReactNode;
  /** 最多展示多少个，其余折叠为 +N。 */
  maxCount?: number;
  overlap?: number;
  /** 折叠徽标的大小。 */
  overflowSize?: AvatarSize;
  /** 折叠徽标形状。 */
  shape?: AvatarShape;
  /** 自定义折叠徽标内容。 */
  overflowRender?: (restCount: number) => ReactNode;
  classNames?: AvatarGroupClassNames;
  styles?: AvatarGroupStyles;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(
    inputProps,
    ref,
  ) {
    const {
      children,
      maxCount,
      overlap,
      overflowSize = 'md',
      shape = 'circle',
      overflowRender,
      classNames,
      styles,
      className,
      style,
      ...rest
    } = useComponentDefaults('AvatarGroup', inputProps);
    const { t } = useLocale();
    const items = Children.toArray(children) as ReactElement[];
    const overflow =
      maxCount !== undefined && items.length > maxCount
        ? items.length - maxCount
        : 0;
    const visible = overflow > 0 ? items.slice(0, maxCount) : items;

    const overflowStyle =
      typeof overflowSize === 'number'
        ? { width: overflowSize, height: overflowSize }
        : null;

    return (
      <div
        ref={ref}
        {...rest}
        data-slot="avatar-group"
        role={rest.role ?? 'group'}
        aria-label={
          rest['aria-label'] ??
          t('avatar.group', { 'zh-CN': '头像组', en: 'Avatar group' })
        }
        className={cx('yuki-avatar-group', classNames?.root, className)}
        style={{ ...(Number.isFinite(overlap) && { '--yuki-avatar-group-overlap': `${Math.max(0, overlap!)}px` }), ...styles?.root, ...style } as CSSProperties}
      >
        {visible}
        {overflow > 0 ? (
          <span
            data-slot="overflow"
            role="img"
            aria-label={t(
              'avatar.overflow',
              { 'zh-CN': '还有 {count} 个头像', en: '{count} more avatars' },
              { count: overflow },
            )}
            className={cx(
              'yuki-avatar',
              'yuki-avatar__overflow',
              typeof overflowSize === 'string' && `yuki-avatar--${overflowSize}`,
              `yuki-avatar--${shape}`,
              classNames?.overflow,
            )}
            style={{ ...overflowStyle, ...styles?.overflow }}
          >
            {overflowRender ? overflowRender(overflow) : `+${overflow}`}
          </span>
        ) : null}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';
