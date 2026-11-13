import { Button, Card } from '@yuki-ui/react';

export default function BasicCard() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-5)', maxWidth: 420 }}>
      <Card title="项目概览">
        本周共合入 12 个变更，组件覆盖率提升至 87%。
      </Card>
      <Card
        title="待办事项"
        extra={<Button size="sm" variant="ghost">全部</Button>}
        actions={['查看', '编辑', '归档'].map((label) => (
          <span key={label}>{label}</span>
        ))}
      >
        还有 3 个页面等待视觉走查。
      </Card>
    </div>
  );
}
