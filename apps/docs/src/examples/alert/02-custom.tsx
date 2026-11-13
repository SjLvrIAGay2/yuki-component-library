import { Alert, Space } from '@yuki-ui/react';

export default function CustomAlert() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Space direction="vertical" size="3">
        <Alert variant="solid" tone="info" title="实心提示" description="适用于页面级横幅或强提醒。" />
        <Alert variant="solid" tone="success" title="实心成功" description="提交后给出明确的正向反馈。" />
        <Alert variant="solid" tone="danger" title="实心错误" description="需要立刻处理的问题。" />
      </Space>

      <Space direction="vertical" size="3">
        <Alert variant="outline" tone="info" title="描边提示" description="开启 outline 后只保留语义色边框。" />
        <Alert variant="outline" tone="warning" title="描边警告" description="视觉更轻，适合信息密度较高的区域。" />
      </Space>

      <Alert
        banner
        tone="warning"
        title="服务维护通知"
        description="2 月 18 日 02:00–04:00 进行数据库升级，期间只读。"
        action={<button type="button">了解详情</button>}
      />
    </div>
  );
}
