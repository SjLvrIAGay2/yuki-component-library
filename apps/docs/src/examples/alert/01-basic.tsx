import { Alert } from '@yuki-ui/react';

export default function BasicAlert() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Alert
        tone="info"
        title="版本更新"
        description="组件库将于本周五发布 1.4.0，包含 Tour 与 Drawer 两个新组件。"
      />
      <Alert
        tone="success"
        title="发布成功"
        description="站点已同步到边缘节点，预计 30 秒内全球生效。"
        closable
      />
      <Alert tone="warning" title="配额即将用尽" description="本月 API 调用额度已使用 88%，请及时扩容。" />
      <Alert
        tone="danger"
        title="构建失败"
        description="packages/ui 的 TypeScript 检查未通过，请查看流水线日志。"
        action={
          <a href="#build" style={{ color: 'inherit', fontWeight: 500 }}>
            查看日志
          </a>
        }
      />
    </div>
  );
}
