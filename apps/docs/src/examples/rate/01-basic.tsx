import { useState } from 'react';
import { Rate } from '@yuki-ui/react';

export default function BasicRate() {
  const [value, setValue] = useState(3);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Rate value={value} onChange={setValue} />
      <Rate defaultValue={4} allowClear />
      <Rate defaultValue={2} disabled />
      <Rate defaultValue={5} size="lg" />
    </div>
  );
}
