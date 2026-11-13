import { useState } from 'react';
import { Button, Icon, QRCode } from '@yuki-ui/react';

export default function CustomQRCode() {
  const [value, setValue] = useState('https://yuki-ui.dev/docs');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-5)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-6)' }}>
        <QRCode
          value={value}
          size={140}
          color="var(--yuki-color-primary)"
          icon={<Icon name="sparkles" size={20} />}
        />
        <QRCode value={value} size={140} bordered status="loading" />
        <QRCode
          value={value}
          size={140}
          bordered
          status="expired"
          onRefresh={() => setValue('https://yuki-ui.dev/docs?v=2')}
        />
      </div>
      <div style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}>
        <Button size="sm" variant="soft" onClick={() => setValue('https://yuki-ui.dev')}>
          切换链接
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setValue('https://yuki-ui.dev/components')}
        >
          组件目录
        </Button>
      </div>
    </div>
  );
}
