import { Carousel } from '@yuki-ui/react';

const colors = [
  'var(--yuki-color-primary-subtle)',
  'var(--yuki-color-bg-muted)',
  'var(--yuki-color-bg-subtle)',
];

const slideStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 180,
  color: 'var(--yuki-color-text-secondary)',
  fontSize: 'var(--yuki-font-size-lg)',
};

export default function BasicCarousel() {
  return (
    <Carousel>
      {colors.map((background, index) => (
        <div key={background} style={{ ...slideStyle, background }}>
          第 {index + 1} 张
        </div>
      ))}
    </Carousel>
  );
}
