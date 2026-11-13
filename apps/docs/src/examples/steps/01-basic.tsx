import { useState } from 'react';
import { Steps, Text } from '@yuki-ui/react';

export default function BasicSteps() {
  const [current, setCurrent] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-5)' }}>
      <Steps
        current={current}
        clickable
        onChange={setCurrent}
        items={[
          { title: '填写信息', description: '基础资料与联系方式' },
          { title: '确认订单', description: '核对商品与金额' },
          { title: '支付', description: '选择支付方式' },
          { title: '完成', description: '等待发货' },
        ]}
      />
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Text size="sm" tone="tertiary">
          当前第 {current + 1} 步
        </Text>
      </div>
    </div>
  );
}
