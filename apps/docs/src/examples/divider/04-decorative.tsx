import { Button, Divider, Space } from '@yuki-ui/react';

export default function Toolbar() {
  return (
    <Space>
      <Button variant="text" onClick={() => window.history.back()}>返回</Button>
      <Divider decorative orientation="vertical" />
      <a href="#/c/button">按钮文档</a>
    </Space>
  );
}
