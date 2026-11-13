import { Icon, InputNumber } from '@yuki-ui/react';

export default function CustomInputNumber() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 320 }}>
      <InputNumber
        label="存储容量"
        defaultValue={256}
        suffix="GB"
        prefix={<Icon name="database" />}
      />
      <InputNumber aria-label="小数" defaultValue={0.5} step={0.05} precision={2} />
      <InputNumber aria-label="无控制器" defaultValue={42} controls={false} />
      <InputNumber aria-label="错误态" status="error" defaultValue={999} max={10} />
    </div>
  );
}
