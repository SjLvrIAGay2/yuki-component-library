import { Skeleton } from '@yuki-ui/react';

export default function BasicSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)', maxWidth: 360 }}>
      <Skeleton />
      <Skeleton avatar title={false} paragraph={{ rows: 2 }} />
      <Skeleton active={false} paragraph={{ rows: 3 }} />
    </div>
  );
}
