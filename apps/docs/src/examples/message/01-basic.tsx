import { Button, Space, message } from '@yuki-ui/react';

export default function BasicMessage() {
  return (
    <Space wrap size="3">
      <Button
        variant="soft"
        tone="success"
        onClick={() => message.success('提交成功，我们会尽快处理。')}
      >
        成功提示
      </Button>
      <Button variant="soft" tone="danger" onClick={() => message.error('网络异常，请稍后重试。')}>
        失败提示
      </Button>
      <Button variant="soft" tone="info" onClick={() => message.info('已复制到剪贴板。')}>
        普通提示
      </Button>
      <Button variant="soft" tone="warning" onClick={() => message.warning('当前内容尚未保存。')}>
        警告提示
      </Button>
      <Button
        variant="soft"
        onClick={() => {
          const handle = message.loading('正在同步数据…');
          window.setTimeout(() => handle.update({ tone: 'success', content: '同步完成', duration: 2000 }), 1200);
        }}
      >
        加载提示
      </Button>
    </Space>
  );
}
