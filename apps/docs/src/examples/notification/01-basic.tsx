import { Button, Space, notification } from '@yuki-ui/react';

export default function BasicNotification() {
  return (
    <Space wrap size="3">
      <Button
        variant="soft"
        tone="success"
        onClick={() =>
          notification.success({
            title: '部署成功',
            description: 'production 环境已更新到提交 9f2c1a3。',
          })
        }
      >
        成功通知
      </Button>
      <Button
        variant="soft"
        tone="danger"
        onClick={() =>
          notification.error({
            title: '同步失败',
            description: '无法连接到远端仓库，请检查凭据。',
          })
        }
      >
        错误通知
      </Button>
      <Button
        variant="soft"
        tone="info"
        onClick={() =>
          notification.info({
            title: '收到新评论',
            description: '林夏在《组件规范》中提到了你。',
          })
        }
      >
        消息通知
      </Button>
      <Button
        variant="soft"
        tone="warning"
        onClick={() =>
          notification.warning({
            title: '证书即将过期',
            description: 'SSL 证书将在 7 天后过期。',
          })
        }
      >
        警告通知
      </Button>
    </Space>
  );
}
