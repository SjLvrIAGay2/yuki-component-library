import { Icon, Input } from '@yuki-ui/react';

export default function BasicInput() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', gap: 'var(--yuki-space-3)', maxWidth: 360 }}>
      <Input placeholder="请输入用户名" />
      <Input
        placeholder="搜索关键词"
        prefix={<Icon name="search" />}
        allowClear
        defaultValue="设计系统"
      />
      <Input placeholder="密码" type="password" />
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Input size="sm" placeholder="小尺寸" />
        <Input size="md" placeholder="中尺寸" />
        <Input size="lg" placeholder="大尺寸" />
      </div>
    </div>
  );
}
