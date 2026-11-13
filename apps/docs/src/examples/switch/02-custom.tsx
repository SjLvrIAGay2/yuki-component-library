import { useState } from 'react';
import { Switch } from '@yuki-ui/react';

export default function CustomSwitch() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const handleChange = (next: boolean) => {
    setEnabled(next);
    if (!next) return;
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)' }}>
      <Switch
        label="自动同步"
        checked={enabled}
        loading={loading}
        checkedChildren="同步中"
        unCheckedChildren="暂停自动同步"
        onChange={handleChange}
      />
      <Switch size="lg" defaultChecked checkedChildren="自动保存" />
      <Switch size="sm" checkedChildren="紧凑" />
    </div>
  );
}
