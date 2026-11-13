import { useState } from 'react';
import { Switch } from '@yuki-ui/react';

export default function BasicSwitch() {
  const [on, setOn] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Switch checked={on} onChange={setOn} />
      <Switch defaultChecked checkedChildren="开" unCheckedChildren="关" />
      <Switch size="sm" defaultChecked checkedChildren="小" />
      <Switch disabled defaultChecked />
    </div>
  );
}
