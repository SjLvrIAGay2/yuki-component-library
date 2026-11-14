import type { StyleProperties, WithStyle } from '../../styles/properties';
import {
  forwardRef,
  useRef,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { cx } from '../../internal/cx';
import { useMediaSource, type MediaSource } from '../../internal/media';
import { Portal } from '../../internal/Portal';
import {
  useControllableState,
  useEscapeKey,
  useFocusTrap,
  useScrollLock,
} from '../../hooks';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon } from '../icon/Icon';
import { ImagePreviewContent } from './ImagePreviewContent';

export type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

/** 图片加载状态，对应根节点 `data-status`。 */
export type ImageStatus = 'loading' | 'loaded' | 'error';

export interface ImagePreviewConfig {
  /** 受控的预览打开状态。 */
  open?: boolean;
  /** 非受控的初始打开状态。 */
  defaultOpen?: boolean;
  /** 预览打开状态变化回调。 */
  onOpenChange?: (open: boolean) => void;
  /** 预览大图地址，默认使用展示图的 `src`。 */
  src?: MediaSource;
  /** 是否显示右上角关闭按钮，默认 `true`。 */
  closable?: boolean;
  /** 点击遮罩是否关闭预览，默认 `true`。 */
  maskClosable?: boolean;
  /** 自定义关闭按钮内容。 */
  closeIcon?: ReactNode;
}

export interface ImageClassNames {
  root?: string;
  img?: string;
  mask?: string;
  fallback?: string;
  placeholder?: string;
  preview?: string;
  previewClose?: string;
  previewImage?: string;
}

export interface ImageStyles {
  root?: StyleProperties;
  img?: StyleProperties;
  mask?: StyleProperties;
  fallback?: StyleProperties;
  placeholder?: StyleProperties;
  preview?: StyleProperties;
  previewClose?: StyleProperties;
  previewImage?: StyleProperties;
}

export interface ImageProps
  extends Omit<WithStyle<HTMLAttributes<HTMLSpanElement>>, 'onLoad' | 'onError'> {
  /** 图片地址。 */
  src: MediaSource;
  /** 替代文本，同时作为预览按钮的可访问名称。 */
  alt?: string;
  /** 容器宽度，数字按 px 处理。 */
  width?: number | string;
  /** 容器高度，数字按 px 处理。 */
  height?: number | string;
  /** 图片填充方式，默认 `cover`。 */
  fit?: ImageFit;
  /** 加载失败时展示的内容。 */
  fallback?: ReactNode;
  /** 加载过程中展示的内容。 */
  placeholder?: ReactNode;
  /** 开启点击预览；可传配置对象。 */
  preview?: boolean | ImagePreviewConfig;
  /** 自定义悬停遮罩内容；传 `false` 关闭默认遮罩。 */
  mask?: ReactNode | false;
  size?: Size;
  /** 透传给内部 `<img>` 的原生属性。 */
  imgProps?: Omit<
    WithStyle<ImgHTMLAttributes<HTMLImageElement>>,
    'src' | 'alt' | 'width' | 'height'
  >;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
  classNames?: ImageClassNames;
  styles?: ImageStyles;
}

const DEFAULT_PREVIEW = {} as const;

/**
 * 图片。支持加载态 / 失败回退 / 悬停遮罩，以及基于 Portal 的全屏预览
 * （焦点陷阱、Esc 关闭、滚动锁定、关闭后焦点还原）。
 */
export const Image = forwardRef<HTMLSpanElement, ImageProps>(function Image(
  inputProps,
  ref,
) {
  const props = useComponentDefaults('Image', inputProps);
  const {
    src,
    alt = '',
    width,
    height,
    fit = 'cover',
    fallback,
    placeholder,
    preview = false,
    mask,
    size: sizeProp,
    imgProps,
    onLoad,
    onError,
    className,
    style,
    classNames,
    styles,
    ...rest
  } = props;

  const displayUrl = useMediaSource(src);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [lastSrc, setLastSrc] = useState(src);

  if (lastSrc !== src) {
    setLastSrc(src);
    setStatus('loading');
  }

  const previewConfig: ImagePreviewConfig =
    typeof preview === 'object' && preview !== null ? preview : DEFAULT_PREVIEW;
  const previewEnabled = Boolean(preview);
  const [open, setOpen] = useControllableState<boolean>({
    value: previewConfig.open,
    defaultValue: previewConfig.defaultOpen ?? false,
    onChange: previewConfig.onOpenChange,
  });

  const overrideSrc = previewConfig.src;
  const previewUrl = useMediaSource(open && previewEnabled && overrideSrc !== src ? overrideSrc : undefined);
  const previewRef = useRef<HTMLDivElement>(null);
  useFocusTrap(previewRef, { active: previewEnabled && open, restoreFocus: true });
  useScrollLock(previewEnabled && open);
  useEscapeKey(() => setOpen(false), previewEnabled && open);

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    // 预览通过 Portal 渲染，React 事件仍会沿组件树冒泡到根节点，需要忽略。
    if (!event.currentTarget.contains(event.target as Node)) return;
    rest.onClick?.(event);
    if (!previewEnabled || event.defaultPrevented) return;
    setOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (!event.currentTarget.contains(event.target as Node)) return;
    rest.onKeyDown?.(event);
    if (!previewEnabled || event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setStatus('loaded');
    imgProps?.onLoad?.(event);
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setStatus('error');
    imgProps?.onError?.(event);
    onError?.(event);
  };

  const showFallback = status === 'error' && fallback != null;
  const triggerLabel = alt || t('image.preview', { 'zh-CN': '预览图片', en: 'Preview image' });

  const maskContent = mask ?? (previewEnabled ? <Icon name="eye" /> : null);
  const fullImageUrl = overrideSrc === undefined || overrideSrc === src ? displayUrl : previewUrl;

  return (
    <span
      {...rest}
      ref={ref}
      data-slot="image"
      data-size={size}
      data-status={status}
      data-preview={previewEnabled || undefined}
      role={previewEnabled ? 'button' : rest.role}
      tabIndex={previewEnabled ? 0 : rest.tabIndex}
      aria-label={previewEnabled ? rest['aria-label'] ?? triggerLabel : rest['aria-label']}
      aria-haspopup={previewEnabled ? 'dialog' : rest['aria-haspopup']}
      className={cx(
        'yuki-image',
        `yuki-image--${size}`,
        previewEnabled && 'yuki-image--previewable',
        classNames?.root,
        className,
      )}
      style={{
        width,
        height,
        ...styles?.root,
        ...style,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {showFallback ? (
        <span
          data-slot="fallback"
          className={cx('yuki-image__fallback', classNames?.fallback)}
          style={styles?.fallback}
        >
          {fallback}
        </span>
      ) : (
        <img
          {...imgProps}
          data-slot="img"
          src={displayUrl}
          alt={alt}
          className={cx('yuki-image__img', classNames?.img, imgProps?.className)}
          style={{ objectFit: fit, ...styles?.img, ...imgProps?.style }}
          onLoad={handleLoad}
          onError={handleError}
          draggable={imgProps?.draggable ?? false}
        />
      )}
      {status === 'loading' && placeholder != null ? (
        <span
          data-slot="placeholder"
          className={cx('yuki-image__placeholder', classNames?.placeholder)}
          style={styles?.placeholder}
        >
          {placeholder}
        </span>
      ) : null}
      {maskContent != null && maskContent !== false && (
        <span data-slot="mask" className={cx('yuki-image__mask', classNames?.mask)} style={styles?.mask} aria-hidden="true">
          {maskContent}
        </span>
      )}
      {previewEnabled && open ? (
        <Portal>
          <div
            ref={previewRef}
            data-slot="preview"
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-label={t('image.previewLabel', {
              'zh-CN': '图片预览',
              en: 'Image preview',
            })}
            className={cx('yuki-image-preview', classNames?.preview)}
            style={styles?.preview}
            onClick={(event) => {
              if (event.target !== event.currentTarget) return;
              if (previewConfig.maskClosable === false) return;
              setOpen(false);
            }}
          >
            {previewConfig.closable !== false ? (
              <button
                type="button"
                data-slot="preview-close"
                className={cx('yuki-image-preview__close', classNames?.previewClose)}
                style={styles?.previewClose}
                aria-label={t('image.closePreview', {
                  'zh-CN': '关闭预览',
                  en: 'Close preview',
                })}
                onClick={() => setOpen(false)}
              >
                {previewConfig.closeIcon ?? <Icon name="x" />}
              </button>
            ) : null}
            <ImagePreviewContent
              key={fullImageUrl}
              src={fullImageUrl}
              alt={alt}
              className={classNames?.previewImage}
              style={styles?.previewImage}
              onBackdropClick={() => {
                if (previewConfig.maskClosable !== false) setOpen(false);
              }}
            />
          </div>
        </Portal>
      ) : null}
    </span>
  );
});

Image.displayName = 'Image';
