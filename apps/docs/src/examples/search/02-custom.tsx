import { useState } from 'react';
import { Icon, Search } from '@yuki-ui/react';

export default function CustomSearch() {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 420 }}>
      <Search
        placeholder="带独立搜索按钮"
        enterButton
        loading={loading}
        onSearch={() => {
          setLoading(true);
          window.setTimeout(() => setLoading(false), 1200);
        }}
      />
      <Search
        placeholder="自定义前缀与按钮"
        prefix={<Icon name="tag" />}
        enterButton={<Icon name="send" />}
        allowClear
      />
      <Search placeholder="大尺寸" size="lg" status="warning" />
    </div>
  );
}
