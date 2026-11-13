import { Carousel, Tag } from '@yuki-ui/react';

const slides = ['设计', '开发', '文档'].map((label, index) => (
  <div
    key={label}
    style={{
      display: 'grid',
      placeItems: 'center',
      gap: 'var(--yuki-space-3)',
      height: 220,
      background: 'var(--yuki-color-bg-subtle)',
    }}
  >
    <Tag tone="primary">第 {index + 1} 页</Tag>
    <strong style={{ fontSize: 'var(--yuki-font-size-2xl)' }}>{label}</strong>
  </div>
));

export default function CustomCarousel() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Carousel autoplay autoplayInterval={2000} items={slides} />
      <Carousel effect="fade" dots={false} items={slides} />
      <Carousel vertical items={slides} />
    </div>
  );
}
