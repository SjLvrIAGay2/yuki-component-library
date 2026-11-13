import { Progress, Space } from '@yuki-ui/react';

export default function BasicProgress() {
  return (
    <Space direction="vertical" size="4">
      <Progress percent={32} />
      <Progress percent={68} tone="info" />
      <Progress percent={100} status="success" />
      <Progress percent={46} status="exception" strokeWidth={12} />
      <Progress percent={84} format={(value) => `${value} / 100 项`} showInfo />
    </Space>
  );
}
