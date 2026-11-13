import { useState } from 'react';
import { ColorPicker } from '@yuki-ui/react';

const brandPresets = [
  '#0ea5e9',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#14b8a6',
];

export default function CustomColorPicker() {
  const [color, setColor] = useState('#0ea5e9');
  const [confirmed, setConfirmed] = useState('#0ea5e9');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', maxWidth: 420 }}>
      <ColorPicker
        label="品牌颜色"
        name="brandColor"
        format="rgb"
        value={color}
        onChange={(next) => setColor(next)}
        onChangeComplete={(next) => setConfirmed(next)}
      />
      <ColorPicker presets={brandPresets} alpha defaultValue="#6366f1" />
      <ColorPicker disabled defaultValue="#94a3b8" />
      <p
        style={{
          margin: 0,
          fontSize: 'var(--yuki-font-size-sm)',
          color: 'var(--yuki-color-text-secondary)',
        }}
      >
        当前：{color} · 已确认：{confirmed}
      </p>
    </div>
  );
}
