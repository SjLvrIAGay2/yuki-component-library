import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useComponentSize, useLocale, type Size } from '../../theme';
import { Icon, type IconName } from '../icon';

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500';
export type ResultTone = 'success' | 'danger' | 'warning' | 'info';

export interface ResultClassNames {
  root?: string;
  icon?: string;
  content?: string;
  title?: string;
  subtitle?: string;
  extra?: string;
}

export interface ResultStyles {
  root?: CSSProperties;
  icon?: CSSProperties;
  content?: CSSProperties;
  title?: CSSProperties;
  subtitle?: CSSProperties;
  extra?: CSSProperties;
}

export interface ResultProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Preset status that drives the default icon, tone and copy. @default 'info' */
  status?: ResultStatus;
  /** Headline. Defaults to the status copy. */
  title?: ReactNode;
  /** Supporting explanation. */
  subTitle?: ReactNode;
  /** Replace the status icon. */
  icon?: ReactNode;
  /** Actions rendered below the copy. */
  extra?: ReactNode;
  /** Component size. */
  size?: Size;
  classNames?: ResultClassNames;
  styles?: ResultStyles;
}

const STATUS_ICONS: Record<ResultStatus, IconName> = {
  success: 'check-circle',
  error: 'x-circle',
  info: 'info',
  warning: 'alert-triangle',
  403: 'lock',
  404: 'search',
  500: 'alert-circle',
};

const STATUS_TONES: Record<ResultStatus, ResultTone> = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
  403: 'warning',
  404: 'info',
  500: 'danger',
};

export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(inputProps, ref) {
  const props = useComponentDefaults('Result', inputProps);
  const {
    status = 'info',
    title,
    subTitle,
    icon,
    extra,
    size: sizeProp,
    classNames,
    styles,
    className,
    style,
    ...rest
  } = props;
  const size = useComponentSize(sizeProp);
  const { t } = useLocale();
  const tone = STATUS_TONES[status];
  const defaultTitle: Record<ResultStatus, ReactNode> = {
    success: t('result.success', { 'zh-CN': '操作成功', 'en-US': 'Success' }),
    error: t('result.error', { 'zh-CN': '操作失败', 'en-US': 'Something went wrong' }),
    info: t('result.info', { 'zh-CN': '提示信息', 'en-US': 'Info' }),
    warning: t('result.warning', { 'zh-CN': '警告', 'en-US': 'Warning' }),
    403: t('result.403', { 'zh-CN': '无权访问', 'en-US': 'Forbidden' }),
    404: t('result.404', { 'zh-CN': '页面不存在', 'en-US': 'Page not found' }),
    500: t('result.500', { 'zh-CN': '服务器错误', 'en-US': 'Server error' }),
  };

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('yuki-result', `yuki-result--${status}`, classNames?.root, className)}
      style={{ ...style, ...styles?.root }}
      data-slot="root"
      data-status={status}
      data-size={size}
    >
      <div
        className={cx('yuki-result__icon', classNames?.icon)}
        style={styles?.icon}
        data-slot="icon"
        data-tone={tone}
        aria-hidden="true"
      >
        {icon ?? <Icon name={STATUS_ICONS[status]} />}
      </div>
      <div className={cx('yuki-result__content', classNames?.content)} style={styles?.content} data-slot="content">
        <div className={cx('yuki-result__title', classNames?.title)} style={styles?.title} data-slot="title">
          {title ?? defaultTitle[status]}
        </div>
        {subTitle != null && (
          <div
            className={cx('yuki-result__subtitle', classNames?.subtitle)}
            style={styles?.subtitle}
            data-slot="subtitle"
          >
            {subTitle}
          </div>
        )}
      </div>
      {extra != null && (
        <div className={cx('yuki-result__extra', classNames?.extra)} style={styles?.extra} data-slot="extra">
          {extra}
        </div>
      )}
    </div>
  );
});

Result.displayName = 'Result';
