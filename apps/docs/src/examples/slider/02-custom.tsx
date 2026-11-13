import { Slider } from '@yuki-ui/react';

export default function CustomSlider() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-8)', maxWidth: 420 }}>
      <Slider
        aria-label="评分"
        defaultValue={60}
        step={10}
        marks={{ 0: '差', 50: '中', 100: '好' }}
        showValue
      />
      <Slider
        aria-label="反向"
        defaultValue={80}
        reverse
        formatValue={(value) => `${value}%`}
        showValue
      />
      <Slider
        aria-label="大尺寸"
        size="lg"
        defaultValue={25}
        step={5}
        marks={{ 0: '0', 100: '100' }}
      />
    </div>
  );
}
