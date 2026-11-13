import { useState } from 'react';
import { Button, RadioGroup, Space } from '@yuki-ui/react';

export default function RequireAudience() {
  const [choice, setChoice] = useState('');
  const [checked, setChecked] = useState(false);
  return (
    <Space direction="vertical">
      <RadioGroup label="接收人" options={['负责人', '全体成员']} value={choice}
        onChange={value => setChoice(String(value))}
        error={checked && !choice ? '请选择接收人' : undefined} />
      <Button variant="outline" onClick={() => setChecked(true)}>验证选择</Button>
    </Space>
  );
}
