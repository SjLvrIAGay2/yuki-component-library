import { Button, Popconfirm, Space, message } from '@yuki-ui/react';

export default function BasicPopconfirm() {
  return (
    <Space wrap size="3">
      <Popconfirm
        title="删除该文件？"
        description="文件会移入回收站，30 天后自动清理。"
        onConfirm={() => {
          message.success('已移入回收站');
        }}
      >
        <Button tone="danger" variant="soft">
          删除文件
        </Button>
      </Popconfirm>

      <Popconfirm
        title="退出当前账号？"
        description="未同步的草稿会保留在本机。"
        okText="退出"
        onConfirm={() => {
          message.info('已退出');
        }}
        onCancel={() => {
          message.info('已取消');
        }}
      >
        <Button variant="outline">退出登录</Button>
      </Popconfirm>
    </Space>
  );
}
