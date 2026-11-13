import { useMemo, useState } from 'react';
import { Button, Statistic } from '@yuki-ui/react';

export default function CustomStatistic() {
  const [tick, setTick] = useState(0);
  const value = useMemo(() => 1024 + tick * 137, [tick]);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-5)', maxWidth: 460 }}>
      <Statistic
        title="实时订单"
        value={value}
        countUp
        countDuration={1200}
        prefix="¥"
        precision={2}
        valueStyle={{ color: 'var(--yuki-color-primary)' }}
      />
      <Statistic
        title="自定义格式化"
        value={3812}
        formatter={(value) => `约 ${value} 次`}
        valueRender={(formatted) => <em>{formatted}</em>}
        suffix="今日"
      />
      <Statistic title="加载中" value={0} loading />
      <Button
        size="sm"
        variant="soft"
        onClick={() => setTick((current) => current + 1)}
      >
        刷新数据
      </Button>
    </div>
  );
}
