import { Progress, Space } from '@yuki-ui/react';

export default function CustomProgress() {
  return (
    <Space wrap size="6" align="center">
      <Progress type="circle" percent={72} />
      <Progress type="circle" percent={100} status="success" />
      <Progress type="circle" percent={38} status="exception" size={96} strokeWidth={8} />
      <Progress type="circle" percent={0} size={64} indeterminate aria-label="正在加载" />
      <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', minWidth: 240 }}>
        <Progress value={3} max={25} tone="success" label="文件上传" formatValue={(count, max) => `${count} / ${max} 个`} />
        <Progress percent={56} tone="warning" />
        <Progress percent={92} tone="danger" />
        <Progress indeterminate showInfo={false} aria-label="正在加载" />
      </div>
    </Space>
  );
}
