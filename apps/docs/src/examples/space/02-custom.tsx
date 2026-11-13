import { Divider, Space, Text } from '@yuki-ui/react';

export default function CustomSpace() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-6)' }}>
      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          垂直 Space + size 元组（水平 3 / 垂直 4）
        </Text>
        <Space direction="vertical" size={['3', '4']} align="start">
          <Text weight="medium">发布前检查</Text>
          <Text tone="secondary" size="sm">
            类型检查、单元测试与 token 检查全部通过。
          </Text>
          <Text tone="secondary" size="sm">
            文档站已包含每个组件的两个以上示例。
          </Text>
          <Space size="2" split={<span style={{ color: 'var(--yuki-color-text-tertiary)' }}>·</span>}>
            <Text size="xs" tone="tertiary">
              更新于 3 分钟前
            </Text>
            <Text size="xs" tone="tertiary">
              由 CI 触发
            </Text>
            <Text size="xs" tone="tertiary">
              版本 0.1.0
            </Text>
          </Space>
        </Space>
      </div>

      <Divider />

      <div>
        <Text size="sm" tone="tertiary" style={{ display: 'block', marginBottom: 'var(--yuki-space-2)' }}>
          split 使用符号节点
        </Text>
        <Space size="2" split={<span aria-hidden>→</span>}>
          <Text size="sm">输入</Text>
          <Text size="sm">校验</Text>
          <Text size="sm">提交</Text>
        </Space>
      </div>
    </div>
  );
}
