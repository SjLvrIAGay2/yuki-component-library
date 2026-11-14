import type { WithStyle } from '../../styles/properties';
import { forwardRef, type ImgHTMLAttributes } from 'react';
import { useMediaSource, type MediaSource } from '../../internal/media';
import { cx } from '../../internal/cx';
import { useComponentDefaults } from '../../theme';

export interface ImageViewerProps extends Omit<WithStyle<ImgHTMLAttributes<HTMLImageElement>>, 'src'> {
  src?: MediaSource;
  alt: string;
}

/** Displays an image without interpreting document markup; owns URLs created from Blobs. */
export const ImageViewer = forwardRef<HTMLImageElement, ImageViewerProps>(
  function ImageViewer(input, ref) {
    const { src, alt, className, ...props } = useComponentDefaults('ImageViewer', input);
    const url = useMediaSource(src);
    return (
      <img
        {...props}
        ref={ref}
        src={url || undefined}
        alt={alt}
        className={cx('yuki-image-viewer', className)}
      />
    );
  },
);
