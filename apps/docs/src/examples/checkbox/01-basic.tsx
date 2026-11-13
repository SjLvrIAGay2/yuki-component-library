import { Checkbox } from '@yuki-ui/react';

export default function BasicCheckbox() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Checkbox defaultChecked>接收产品更新邮件</Checkbox>
      <Checkbox>订阅每周设计周刊</Checkbox>
      <Checkbox defaultChecked disabled>
        已在管理后台锁定
      </Checkbox>
      <Checkbox size="lg">大尺寸复选框</Checkbox>
    </div>
  );
}
