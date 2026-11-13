import { useState } from 'react';
import { Slider } from '@yuki-ui/react';

export default function BasicSlider() {
  const [value, setValue] = useState(40);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', maxWidth: 420 }}>
      <Slider aria-label="音量" value={value} onChange={setValue} showValue />
      <Slider aria-label="透明度" defaultValue={65} />
      <Slider aria-label="禁用" defaultValue={30} disabled />
      <Slider aria-label="小尺寸" defaultValue={10} size="sm" />
    </div>
  );
}
