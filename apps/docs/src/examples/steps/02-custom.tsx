import { useState } from 'react';
import { Button, Steps, Text } from '@yuki-ui/react';

export default function CustomSteps() {
  const [current, setCurrent] = useState(1);
  const [progressDot, setProgressDot] = useState(true);

  const items = [
    { title: '创建', description: '初始化项目' },
    { title: '构建', description: '编译资源' },
    { title: '校验', description: '静态检查失败', status: 'error' as const },
    { title: '发布', description: '等待中', disabled: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-6)' }}>
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Button size="sm" onClick={() => setProgressDot((value) => !value)}>
          {progressDot ? '使用数字' : '使用圆点'}
        </Button>
        <Button size="sm" onClick={() => setCurrent((value) => Math.max(0, value - 1))}>
          上一步
        </Button>
        <Button size="sm" onClick={() => setCurrent((value) => Math.min(items.length - 1, value + 1))}>
          下一步
        </Button>
      </div>

      <Steps progressDot={progressDot} current={current} onChange={setCurrent} clickable items={items} />
      <Steps progressDot={progressDot} direction="vertical" current={current} status="process" size="sm" items={items} />
      <Text size="sm" tone="tertiary">
        垂直方向、自定义状态与禁用步骤。
      </Text>
    </div>
  );
}
