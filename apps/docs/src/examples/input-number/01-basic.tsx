import { InputNumber } from '@yuki-ui/react';

export default function BasicInputNumber() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 320 }}>
      <InputNumber aria-label="数量" defaultValue={3} min={0} max={99} />
      <InputNumber aria-label="价格" defaultValue={19.9} step={0.1} precision={1} />
      <InputNumber aria-label="禁用" defaultValue={12} disabled />
      <InputNumber aria-label="大尺寸" size="lg" defaultValue={128} />
    </div>
  );
}
