import lake from '../../assets/alpine-lake.jpg';
import { useState } from 'react';
import { Carousel, Image, Watermark } from '@yuki-ui/react';

export default function GalleryExample() {
  const [files, setFiles] = useState<File[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const images = files.length
    ? files.map((file) => ({ src: file, label: file.name }))
    : [
        { src: lake, label: '山间湖泊' },
        { src: './samples/yuki-motion.png', label: '动效封面' },
      ];
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', width: '100%' }}>
      <label>
        选择相册图片{' '}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(event) => {
            setFiles(Array.from(event.target.files ?? []));
            setActiveIndex(0);
          }}
        />
      </label>
      <Carousel activeIndex={activeIndex} onChange={setActiveIndex} ariaLabel="预览相册">
        {images.map(({ src, label }, index) => (
          <Watermark key={index} content={label}>
            <Image
              src={src}
              alt={label}
              width="100%"
              style={{ aspectRatio: '16 / 9', display: 'block' }}
              fit="cover"
              preview
            />
          </Watermark>
        ))}
      </Carousel>
    </div>
  );
}
