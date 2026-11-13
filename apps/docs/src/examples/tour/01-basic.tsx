import { useState } from 'react';
import { Button, Space, Tour } from '@yuki-ui/react';

const steps = [
  {
    target: '#tour-basic-create',
    title: '创建项目',
    description: '从这里开始一个新的项目，模板会自动初始化目录结构。',
    placement: 'bottom' as const,
  },
  {
    target: '#tour-basic-search',
    title: '全局搜索',
    description: '按 ⌘K 搜索项目、成员与文档。',
    placement: 'bottom' as const,
  },
  {
    target: '#tour-basic-account',
    title: '账号与设置',
    description: '在这里管理通知偏好、快捷键与主题。',
    placement: 'left' as const,
  },
];

export default function BasicTour() {
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  return (
    <Space direction="vertical" size="6">
      <Space wrap size="3">
        <Button id="tour-basic-create" onClick={() => setOpen(true)}>
          创建项目
        </Button>
        <Button id="tour-basic-search" variant="outline">
          全局搜索
        </Button>
        <Button id="tour-basic-account" variant="ghost">
          账号设置
        </Button>
      </Space>

      <p style={{ margin: 0, fontSize: 'var(--yuki-font-size-sm)', color: 'var(--yuki-color-text-secondary)' }}>
        {finished ? '导览已完成，可随时重新开始。' : '点击「创建项目」开始三步导览。'}
      </p>

      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={steps}
        onFinish={() => setFinished(true)}
        onSkip={() => setFinished(false)}
      />
    </Space>
  );
}
