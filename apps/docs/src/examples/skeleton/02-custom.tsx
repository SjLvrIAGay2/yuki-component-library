import { useState } from 'react';
import { Button, Skeleton } from '@yuki-ui/react';

export default function CustomSkeleton() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', maxWidth: 400 }}>
      <Skeleton
        loading={loading}
        round
        avatar={{ size: 48, shape: 'circle' }}
        title={{ width: '40%' }}
        paragraph={{ rows: 3, width: ['100%', '88%', '64%'] }}
      >
        <div style={{ display: 'grid', gap: 'var(--yuki-space-2)' }}>
          <strong>设计系统周报</strong>
          <span style={{ color: 'var(--yuki-color-text-secondary)' }}>
            本周共发布 6 个组件，新增 12 条视觉回归用例。
          </span>
        </div>
      </Skeleton>
      <Button
        size="sm"
        variant="soft"
        onClick={() => setLoading((value) => !value)}
      >
        {loading ? '加载完成' : '重新加载'}
      </Button>
    </div>
  );
}
