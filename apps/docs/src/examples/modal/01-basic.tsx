import { useState } from 'react';
import { Button, Modal, Space, Text } from '@yuki-ui/react';

export default function BasicModal() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Space wrap size="3">
      <Button onClick={() => setOpen(true)}>打开对话框</Button>
      <Button variant="outline" onClick={() => setConfirmOpen(true)}>
        确认操作
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="重命名项目"
        description="名称会同步到所有协作者的工作区。"
        onOk={() => setOpen(false)}
      >
        <Text size="sm" tone="secondary">
          项目 ID 保持不变，历史提交与链接不会失效。
        </Text>
      </Modal>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="删除该草稿？"
        description="删除后无法恢复，此操作不可撤销。"
        okTone="danger"
        okText="删除"
        onOk={() => setConfirmOpen(false)}
      >
        <Text size="sm" tone="secondary">
          草稿包含 12 张图片与 3 个附件，删除后将从存储中移除。
        </Text>
      </Modal>
    </Space>
  );
}
