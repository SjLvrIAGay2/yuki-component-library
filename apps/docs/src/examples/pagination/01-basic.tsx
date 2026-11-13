import { Pagination } from '@yuki-ui/react';

export default function BasicPagination() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Pagination total={120} defaultPage={1} />
      <Pagination total={120} defaultPage={6} showTotal={(total, range) => `${range[0]}–${range[1]} / 共 ${total} 条`} />
      <Pagination total={120} defaultPage={3} simple showTotal />
    </div>
  );
}
