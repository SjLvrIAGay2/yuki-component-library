import type { WithStyle } from '../../styles/properties';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Icon } from '../icon';
import { useComponentDefaults } from '../../theme';
export interface EmptyStateProps extends Omit<WithStyle<HTMLAttributes<HTMLDivElement>>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  iconProps?: WithStyle<HTMLAttributes<HTMLSpanElement>>;
  titleProps?: WithStyle<HTMLAttributes<HTMLHeadingElement>>;
  descriptionProps?: WithStyle<HTMLAttributes<HTMLParagraphElement>>;
  actionProps?: WithStyle<HTMLAttributes<HTMLDivElement>>;
}
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(input, ref) {
    const {
      title,
      description,
      icon = <Icon name="search" />,
      action,
      className,
      iconProps,
      titleProps,
      descriptionProps,
      actionProps,
      ...props
    } = useComponentDefaults('EmptyState', input);
    return (
      <div {...props} ref={ref} className={cx('yuki-empty-state', className)}>
        <span {...iconProps} className={cx('yuki-empty-state__icon', iconProps?.className)}>
          {icon}
        </span>
        <h3 {...titleProps} className={cx('yuki-empty-state__title', titleProps?.className)}>
          {title}
        </h3>
        {description && (
          <p
            {...descriptionProps}
            className={cx('yuki-empty-state__description', descriptionProps?.className)}
          >
            {description}
          </p>
        )}
        {action && (
          <div {...actionProps} className={cx('yuki-empty-state__action', actionProps?.className)}>
            {action}
          </div>
        )}
      </div>
    );
  },
);
