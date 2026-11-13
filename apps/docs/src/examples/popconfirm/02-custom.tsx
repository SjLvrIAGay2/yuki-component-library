import { Button, Popconfirm, Space, message } from '@yuki-ui/react';

export default function CustomPopconfirm() {
  return (
    <Space wrap size="3">
      <Popconfirm
        title="永久删除该工作区？"
        description="所有项目、成员与历史记录都会被清除，且无法恢复。"
        placement="bottom"
        okTone="danger"
        okText="永久删除"
        cancelText="再想想"
        icon={null}
        onConfirm={() => {
          message.success('工作区已删除');
        }}
      >
        <Button tone="danger" variant="outline">
          危险操作
        </Button>
      </Popconfirm>

      <Popconfirm
        title="发布到生产环境？"
        description="确认后会触发构建与灰度发布。"
        okText="发布"
        onConfirm={() =>
          new Promise<void>((resolve) => {
            window.setTimeout(() => {
              message.success('已提交发布任务');
              resolve();
            }, 1200);
          })
        }
      >
        <Button>异步确认</Button>
      </Popconfirm>
    </Space>
  );
}
