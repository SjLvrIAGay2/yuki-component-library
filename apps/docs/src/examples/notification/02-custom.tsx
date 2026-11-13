import { Button, Space, notification } from '@yuki-ui/react';

export default function CustomNotification() {
  return (
    <Space wrap size="3">
      <Button
        onClick={() =>
          notification.open({
            title: '长期驻留',
            description: '关闭自动消失，需要用户手动关闭。',
            placement: 'bottomRight',
            duration: 0,
          })
        }
      >
        右下角 · 不自动关闭
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          notification.open({
            title: '带操作的通知',
            description: '邀请已发送至 lin@example.com。',
            duration: 0,
            action: (
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 0,
                  padding: 0,
                  color: 'var(--yuki-color-primary)',
                  cursor: 'pointer',
                }}
              >
                撤销邀请
              </button>
            ),
          })
        }
      >
        带操作
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          notification.open({
            title: '左上角通知',
            description: 'placement 支持四角与上下居中。',
            placement: 'topLeft',
            duration: 3000,
            closable: false,
          })
        }
      >
        左上角 · 无关闭按钮
      </Button>
    </Space>
  );
}
