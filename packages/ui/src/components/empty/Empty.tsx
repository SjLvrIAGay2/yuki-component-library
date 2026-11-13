import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';

export interface EmptyClassNames {
  root?: string;
  image?: string;
  description?: string;
  footer?: string;
}

export interface EmptyStyles {
  root?: CSSProperties;
  image?: CSSProperties;
  description?: CSSProperties;
  footer?: CSSProperties;
}

export interface EmptyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 自定义插图：传入字符串按图片地址处理，传 null 隐藏。 */
  image?: ReactNode;
  /** 使用图标代替默认插图。 */
  icon?: ReactNode;
  /** 描述文案，传 null 隐藏。 */
  description?: ReactNode;
  /** 尺寸。 */
  size?: Size;
  /** 插图区域的额外样式。 */
  imageStyle?: CSSProperties;
  /** 操作区内容，例如按钮。 */
  children?: ReactNode;
  classNames?: EmptyClassNames;
  styles?: EmptyStyles;
}

function DefaultIllustration() {
  return (
    <svg
      data-slot="illustration"
      className="yuki-empty__illustration"
      viewBox="0 0 96 72"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="48"
        cy="64"
        rx="32"
        ry="5"
        fill="var(--yuki-color-bg-subtle)"
      />
      <rect
        x="20"
        y="16"
        width="56"
        height="40"
        rx="8"
        fill="var(--yuki-color-bg-subtle)"
        stroke="var(--yuki-color-border)"
        strokeWidth="1.5"
      />
      <path
        d="M30 34h36"
        stroke="var(--yuki-color-border-strong)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M30 42h22"
        stroke="var(--yuki-color-border)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="68"
        cy="20"
        r="7"
        fill="var(--yuki-color-primary-subtle)"
        stroke="var(--yuki-color-primary-border)"
        strokeWidth="1.5"
      />
      <path
        d="m65.5 20 2 2 3-3.5"
        stroke="var(--yuki-color-primary)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  inputProps,
  ref,
) {
  const {
    image,
    icon,
    description,
    size: sizeProp,
    imageStyle,
    children,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = useComponentDefaults('Empty', inputProps);
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();

  const descriptionContent =
    description === undefined
      ? t('empty.description', { 'zh-CN': '暂无数据', en: 'No data' })
      : description;

  let imageContent: ReactNode = null;
  if (image !== null) {
    if (typeof image === 'string') {
      imageContent = (
        <img
          data-slot="image-el"
          className="yuki-empty__image-el"
          src={image}
          alt=""
          aria-hidden="true"
        />
      );
    } else if (image !== undefined) {
      imageContent = image;
    } else if (icon !== undefined) {
      imageContent = (
        <span data-slot="icon" className="yuki-empty__icon" aria-hidden="true">
          {icon}
        </span>
      );
    } else {
      imageContent = <DefaultIllustration />;
    }
  }

  return (
    <div
      ref={ref}
      {...rest}
      data-slot="empty"
      data-size={size}
      className={cx(
        'yuki-empty',
        `yuki-empty--${size}`,
        classNames?.root,
        className,
      )}
      style={{ ...styles?.root, ...style }}
    >
      {imageContent !== null ? (
        <div
          data-slot="image"
          className={cx('yuki-empty__image', classNames?.image)}
          style={{ ...styles?.image, ...imageStyle }}
        >
          {imageContent}
        </div>
      ) : null}

      {descriptionContent !== null ? (
        <div
          data-slot="description"
          className={cx('yuki-empty__description', classNames?.description)}
          style={styles?.description}
        >
          {descriptionContent}
        </div>
      ) : null}

      {children !== undefined && children !== null ? (
        <div
          data-slot="footer"
          className={cx('yuki-empty__footer', classNames?.footer)}
          style={styles?.footer}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
});

Empty.displayName = 'Empty';
