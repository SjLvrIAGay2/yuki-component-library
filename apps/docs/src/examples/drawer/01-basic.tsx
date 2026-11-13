import { useState } from 'react';
import { Button, Drawer, Space, Text } from '@yuki-ui/react';

export default function BasicDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开抽屉</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="筛选条件"
        description="调整后立即应用于当前列表。"
        onOk={() => setOpen(false)}
      >
        <Space direction="vertical" size="4">
          <Text size="sm" tone="secondary">
            左侧面板承载轻量任务，不打断用户对列表上下文的感知。
          </Text>
          <div style={{ display: 'grid', gap: 'var(--yuki-space-2)' }}>
            <label style={{ fontSize: 'var(--yuki-font-size-sm)' }}>
              <input type="checkbox" defaultChecked /> 仅显示已归档
            </label>
            <label style={{ fontSize: 'var(--yuki-font-size-sm)' }}>
              <input type="checkbox" /> 仅显示我的关注
            </label>
            <label style={{ fontSize: 'var(--yuki-font-size-sm)' }}>
              <input type="checkbox" defaultChecked /> 包含子项目
            </label>
          </div>
        </Space>
      </Drawer>
    </>
  );
}
