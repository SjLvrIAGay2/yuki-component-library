import { Button, Result, Space } from '@yuki-ui/react';

export default function BasicResult() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Result
        status="success"
        title="发布成功"
        subTitle="站点已部署到 production 环境，预计 1 分钟内生效。"
        extra={
          <Space size="2">
            <Button>查看站点</Button>
            <Button variant="ghost">返回项目</Button>
          </Space>
        }
      />
      <Result
        status="warning"
        title="存在未保存的更改"
        subTitle="离开前请保存，否则本次编辑将丢失。"
        extra={<Button variant="outline">继续编辑</Button>}
      />
    </div>
  );
}
