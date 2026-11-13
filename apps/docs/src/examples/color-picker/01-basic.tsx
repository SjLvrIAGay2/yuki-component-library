import { useState } from 'react';
import { ColorPicker } from '@yuki-ui/react';

export default function BasicColorPicker() {
  const [color, setColor] = useState('#3b82f6');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 360 }}>
      <ColorPicker value={color} onChange={(next) => setColor(next)} />
      <ColorPicker defaultValue="#22c55e" />
      <ColorPicker size="sm" allowClear placeholder="选择颜色" />
      <ColorPicker alpha defaultValue="#6366f1" />
    </div>
  );
}
