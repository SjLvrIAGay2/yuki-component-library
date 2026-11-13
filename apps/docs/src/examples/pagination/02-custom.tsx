import { useState } from 'react';
import { Pagination, Text } from '@yuki-ui/react';

export default function CustomPagination() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Pagination
        total={486}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        showSizeChanger
        showQuickJumper
        showTotal
        onChange={(nextPage, nextSize) => {
          setPage(nextPage);
          setPageSize(nextSize);
        }}
      />
      <Text size="sm" tone="tertiary">
        当前第 {page} 页 · 每页 {pageSize} 条 · 共 486 条
      </Text>

      <Pagination total={200} page={page} pageSize={pageSize} size="sm" siblingCount={0} boundaryCount={2} previousContent="上一页" nextContent="下一页" onChange={setPage} />
      <Pagination total={200} page={page} pageSize={pageSize} size="lg" disabled />
    </div>
  );
}
