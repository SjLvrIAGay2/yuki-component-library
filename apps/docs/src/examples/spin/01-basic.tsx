import { useState } from 'react';
import { Button, Space, Spin, Text } from '@yuki-ui/react';

export default function BasicSpin() {
  const [spinning, setSpinning] = useState(true);

  return (
    <Space direction="vertical" size="6">
      <Space wrap size="6" align="center">
        <Spin size="sm" />
        <Spin />
        <Spin size="lg" />
        <Spin tip="正在加载数据…" />
      </Space>

      <Space size="3">
        <Button onClick={() => setSpinning((value) => !value)}>
          {spinning ? '停止加载' : '开始加载'}
        </Button>
      </Space>

      <Spin spinning={spinning} tip="正在刷新列表…">
        <div
          style={{
            padding: 'var(--yuki-space-6)',
            border: '1px solid var(--yuki-color-border-subtle)',
            borderRadius: 'var(--yuki-radius-lg)',
          }}
        >
          <Text size="sm" tone="secondary">
            被遮罩的内容会保留布局尺寸，加载时不会发生跳动。
          </Text>
        </div>
      </Spin>
    </Space>
  );
}
