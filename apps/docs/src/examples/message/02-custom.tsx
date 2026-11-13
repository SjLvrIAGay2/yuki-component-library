import { Button, Space, message } from '@yuki-ui/react';

export default function CustomMessage() {
  return (
    <Space wrap size="3">
      <Button
        onClick={() =>
          message.open({
            content: '草稿已自动保存，可在草稿箱中继续编辑。',
            placement: 'topRight',
            duration: 5000,
            closable: true,
          })
        }
      >
        右上角 · 可关闭
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          message.open({
            content: '新版本可用，刷新后生效。',
            placement: 'bottom',
            action: (
              <button type="button" style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>
                立即刷新
              </button>
            ),
          })
        }
      >
        底部 · 带操作
      </Button>
      <Button
        variant="ghost"
        onClick={() => message.open({ content: '2 秒后自动关闭', duration: 2000 })}
      >
        自定义时长
      </Button>
      <Button
        variant="text"
        onClick={() => {
          message.config({ placement: 'top', maxCount: 3 });
          ['第一项', '第二项', '第三项', '第四项'].forEach((text) =>
            message.info(`最多同时显示三条：${text}`),
          );
        }}
      >
        全局配置
      </Button>
    </Space>
  );
}
