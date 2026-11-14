import type { WithStyle } from '../../styles/properties';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx';

export const CardHeader = forwardRef<HTMLDivElement, WithStyle<HTMLAttributes<HTMLDivElement>>>(
  function CardHeader({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('yuki-card__header', className)} />;
  },
);
export interface CardTitleProps extends WithStyle<HTMLAttributes<HTMLHeadingElement>> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, as: Tag = 'h3', ...props },
  ref,
) {
  return <Tag {...props} ref={ref} className={cx('yuki-card__title', className)} />;
});
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  WithStyle<HTMLAttributes<HTMLParagraphElement>>
>(function CardDescription({ className, ...props }, ref) {
  return <p {...props} ref={ref} className={cx('yuki-card__description', className)} />;
});
export const CardContent = forwardRef<HTMLDivElement, WithStyle<HTMLAttributes<HTMLDivElement>>>(
  function CardContent({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('yuki-card__body', className)} />;
  },
);
export const CardFooter = forwardRef<HTMLDivElement, WithStyle<HTMLAttributes<HTMLDivElement>>>(
  function CardFooter({ className, ...props }, ref) {
    return <div {...props} ref={ref} className={cx('yuki-card__footer', className)} />;
  },
);
