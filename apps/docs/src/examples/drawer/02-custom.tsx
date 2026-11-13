import { useState } from 'react';
import { Button, Drawer, Space, Text } from '@yuki-ui/react';
import type { DrawerPlacement } from '@yuki-ui/react';

export default function CustomDrawer() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacement>('left');

  const show = (next: DrawerPlacement) => {
    setPlacement(next);
    setOpen(true);
  };

  return (
    <Space wrap size="3">
      <Button variant="outline" onClick={() => show('left')}>
        左侧
      </Button>
      <Button variant="outline" onClick={() => show('bottom')}>
        底部
      </Button>
      <Button
        onClick={() => {
          setPlacement('right');
          setOpen(true);
        }}
      >
        右侧（大尺寸）
      </Button>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        placement={placement}
        size="lg"
        title="编辑成员"
        description="表单与编辑器放在抽屉中，避免额外的页面跳转。"
        footer={
          <Space size="2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              稍后处理
            </Button>
            <Button onClick={() => setOpen(false)}>保存</Button>
          </Space>
        }
      >
        <Space direction="vertical" size="4">
          <Text size="sm" tone="secondary">
            placement 支持 right / left / top / bottom；size 控制面板厚度。
          </Text>
          <Text size="sm" tone="secondary">
            抽屉同样具备焦点陷阱、Esc 关闭、遮罩关闭与滚动锁定。
          </Text>
        </Space>
      </Drawer>
    </Space>
  );
}
