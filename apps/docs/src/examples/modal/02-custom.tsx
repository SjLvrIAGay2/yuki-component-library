import { Button, Modal, Space, message } from '@yuki-ui/react';

export default function CustomModal() {
  return (
    <Space wrap size="3">
      <Button
        onClick={() =>
          Modal.confirm({
            title: '确认删除该分支？',
            content: '分支 feature/checkout 将被永久删除，已合并的提交不受影响。',
            okText: '删除分支',
            okTone: 'danger',
            onOk: () => {
              message.success('分支已删除');
            },
          })
        }
      >
        确认框
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          Modal.info({
            title: '关于快捷键',
            content: '按 ⌘K 打开命令面板，按 Esc 关闭当前浮层。',
          })
        }
      >
        信息框
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          Modal.success({
            title: '导入完成',
            content: '共导入 128 条记录，其中 3 条被跳过。',
          })
        }
      >
        成功框
      </Button>
      <Button
        variant="outline"
        tone="danger"
        onClick={() =>
          Modal.error({
            title: '保存失败',
            content: '服务器返回 500，请稍后重试。',
          })
        }
      >
        错误框
      </Button>
      <Button variant="ghost" onClick={() => Modal.warning({ title: '注意', content: '有未保存的更改。' })}>
        警告框
      </Button>
    </Space>
  );
}
