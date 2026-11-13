import { Icon, Input } from '@yuki-ui/react';

export default function CustomInput() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', gap: 'var(--yuki-space-3)', maxWidth: 420 }}>
      <Input
        addonBefore="https://"
        addonAfter=".com"
        placeholder="域名"
        suffix={<Icon name="link" />}
      />
      <Input showCount maxLength={24} placeholder="最多 24 个字符" />
      <Input
        label="邮箱"
        error="请输入有效的邮箱地址"
        defaultValue="not-an-email"
        prefix={<Icon name="mail" />}
      />
      <Input bordered={false} placeholder="无边框输入" defaultValue="只会显示填充背景" />
    </div>
  );
}
