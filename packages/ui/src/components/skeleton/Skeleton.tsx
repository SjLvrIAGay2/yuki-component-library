import type { StyleProperties, WithStyle } from '../../styles/properties';
import { useConfig, useComponentDefaults } from '../../theme';
import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { useAnimation, type AnimationOptions } from '../../animation';
import { cx } from '../../internal/cx';
import { useLocale, type Size } from '../../theme';

export type SkeletonAvatarShape = 'circle' | 'square';

export interface SkeletonAvatarProps {
  /** 头像骨架尺寸：数字为像素，或使用尺寸档位。 */
  size?: number | Size;
  /** 头像形状。 */
  shape?: SkeletonAvatarShape;
}

export interface SkeletonTitleProps {
  /** 标题宽度。 */
  width?: number | string;
}

export interface SkeletonParagraphProps {
  /** 行数。 */
  rows?: number;
  /** 每行宽度，可传数组逐行设置。 */
  width?: number | string | Array<number | string>;
}

export interface SkeletonClassNames {
  root?: string;
  avatar?: string;
  content?: string;
  title?: string;
  paragraph?: string;
  row?: string;
}

export interface SkeletonStyles {
  root?: StyleProperties;
  avatar?: StyleProperties;
  content?: StyleProperties;
  title?: StyleProperties;
  paragraph?: StyleProperties;
  row?: StyleProperties;
}

export interface SkeletonProps
  extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
  /** 为 false 时直接渲染 children。 */
  loading?: boolean;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  circle?: boolean;
  animation?: AnimationOptions | false;
  /** 是否播放呼吸动画。 */
  active?: boolean;
  /** 是否展示头像骨架。 */
  avatar?: boolean | SkeletonAvatarProps;
  /** 是否展示标题骨架。 */
  title?: boolean | string | SkeletonTitleProps;
  /** 是否展示段落骨架。 */
  paragraph?: boolean | SkeletonParagraphProps;
  /** 使用全圆角。 */
  round?: boolean;
  classNames?: SkeletonClassNames;
  styles?: SkeletonStyles;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(
    inputProps,
    ref,
  ) {
    const {
      loading = true,
      width, height, circle, animation,
      active = true,
      avatar = true,
      title = true,
      paragraph = true,
      round = false,
      classNames,
      styles,
      className,
      style,
      children,
      ...rest
    } = useComponentDefaults('Skeleton', inputProps);
    const { t } = useLocale();
    const customMotion = useConfig().animation !== undefined || animation !== undefined;

    const { duration, delay, ...motion } = useAnimation(active ? animation : false, 'shimmer');
    if (!loading) {
      return <>{children}</>;
    }

    if (width !== undefined || height !== undefined || circle !== undefined) {
      return (
        <div {...rest} {...motion} ref={ref} title={typeof title === 'string' ? title : undefined} aria-hidden={rest['aria-hidden'] ?? true}
          data-slot="skeleton" data-shape={circle ? 'circle' : 'block'}
          className={cx('yuki-skeleton', 'yuki-skeleton__block', motion.className, classNames?.root, className)}
          style={{ ...motion.style, width: width ?? (circle ? height ?? 'var(--yuki-space-4)' : undefined),
            height: height ?? (circle ? width : undefined), ...styles?.root, ...style }}
        />
      );
    }

    const avatarConfig = avatar === true ? {} : avatar || null;
    const titleConfig = title === true || typeof title === 'string' ? {} : title || null;
    const paragraphConfig = paragraph === true ? {} : paragraph || null;

    const rows =
      paragraphConfig && typeof paragraphConfig === 'object'
        ? Math.max(1, Math.floor(Number.isFinite(paragraphConfig.rows) ? paragraphConfig.rows! : 3))
        : 3;
    const paragraphWidths =
      paragraphConfig && typeof paragraphConfig === 'object'
        ? paragraphConfig.width
        : undefined;

    return (
      <div
        ref={ref}
        {...rest}
        {...(customMotion ? motion : undefined)}
        data-slot="skeleton"
        data-active={active || undefined}
        data-round={round || undefined}
        role={rest.role ?? 'status'}
        aria-busy="true"
        aria-label={
          rest['aria-label'] ??
          t('skeleton.loading', { 'zh-CN': '加载中', en: 'Loading' })
        }
        className={cx(
          'yuki-skeleton',
          active && !customMotion && 'yuki-skeleton--active',
          customMotion && motion.className,
          round && 'yuki-skeleton--round',
          classNames?.root,
          className,
        )}
        style={{ ...(customMotion && motion.style), ...styles?.root, ...style }}
      >
        {avatarConfig ? (
          <span
            data-slot="avatar"
            className={cx(
              'yuki-skeleton__avatar',
              typeof avatarConfig.size === 'string' &&
                `yuki-skeleton__avatar--${avatarConfig.size}`,
              classNames?.avatar,
            )}
            style={{
              ...(avatarConfig.size !== undefined &&
              typeof avatarConfig.size === 'number'
                ? { width: avatarConfig.size, height: avatarConfig.size }
                : null),
              ...styles?.avatar,
            }}
            data-shape={avatarConfig.shape ?? 'circle'}
          />
        ) : null}

        <div
          data-slot="content"
          className={cx('yuki-skeleton__content', classNames?.content)}
          style={styles?.content}
        >
          {titleConfig ? (
            <span
              data-slot="title"
              className={cx('yuki-skeleton__title', classNames?.title)}
              style={{
                ...(titleConfig.width !== undefined
                  ? { width: titleConfig.width }
                  : null),
                ...styles?.title,
              }}
            />
          ) : null}

          {paragraphConfig ? (
            <div
              data-slot="paragraph"
              className={cx('yuki-skeleton__paragraph', classNames?.paragraph)}
              style={styles?.paragraph}
            >
              {Array.from({ length: rows }, (_, index) => {
                const width = Array.isArray(paragraphWidths)
                  ? paragraphWidths[index]
                  : index === rows - 1
                    ? paragraphWidths
                    : undefined;
                return (
                  <span
                    key={index}
                    data-slot="row"
                    className={cx('yuki-skeleton__row', classNames?.row)}
                    style={{
                      ...(width !== undefined ? { width } : null),
                      ...styles?.row,
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        <span className="yuki-visually-hidden">
          {t('skeleton.loading', { 'zh-CN': '加载中', en: 'Loading' })}
        </span>
      </div>
    );
  },
);

Skeleton.displayName = 'Skeleton';
