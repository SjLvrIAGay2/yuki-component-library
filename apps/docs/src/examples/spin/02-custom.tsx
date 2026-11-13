import { useState } from 'react';
import { Button, Icon, Space, Spin } from '@yuki-ui/react';

export default function CustomSpin() {
  const [fullscreen, setFullscreen] = useState(false);
  const [delayed, setDelayed] = useState(true);

  return (
    <Space direction="vertical" size="4">
      <Space wrap size="3">
        <Button onClick={() => setFullscreen(true)}>全屏加载</Button>
        <Button variant="outline" onClick={() => setDelayed((value) => !value)}>
          {delayed ? '关闭' : '开启'}延迟显示
        </Button>
      </Space>

      <Spin
        spinning={delayed}
        delay={400}
        size="lg"
        tip="延迟 400ms 后显示，避免闪烁"
        icon={<Icon name="sparkles" spin />}
      >
        <div
          style={{
            minHeight: 160,
            display: 'grid',
            placeItems: 'center',
            border: '1px dashed var(--yuki-color-border)',
            borderRadius: 'var(--yuki-radius-lg)',
            color: 'var(--yuki-color-text-tertiary)',
            fontSize: 'var(--yuki-font-size-sm)',
          }}
        >
          延迟显示与自定义图标
        </div>
      </Spin>

      <Spin spinning={fullscreen} fullscreen tip="正在进入工作区…" size="lg" />

      <Button variant="ghost" onClick={() => setFullscreen(false)}>
        关闭全屏加载
      </Button>
    </Space>
  );
}
