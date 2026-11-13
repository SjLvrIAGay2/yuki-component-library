import { Button, Drawer, Input, Select, Space } from '@yuki-ui/react';

export default function ReviewDraft() {
  return (
    <Drawer trigger={<Button variant="outline">审阅草稿</Button>} forceMount
      title="审阅草稿" description="关闭抽屉后仍可继续填写。" footer={null}>
      <Space direction="vertical" align="start">
        <Select defaultValue="design" options={[
          { value: 'design', label: '设计组' },
          { value: 'engineering', label: '工程组' },
        ]} />
        <Input aria-label="审阅意见" placeholder="填写审阅意见" />
      </Space>
    </Drawer>
  );
}
