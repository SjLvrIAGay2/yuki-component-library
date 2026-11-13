import { useState } from 'react';
import { Input, Table, type TableColumn } from '@yuki-ui/react';

const rows = [
  { name: '产品需求', category: '文档', revision: 3 },
  { name: '交互草案', category: '设计', revision: 2 },
  { name: '图标资源', category: '设计', revision: 5 },
  { name: '颜色令牌', category: '设计', revision: 8 },
  { name: '验收记录', category: '文档', revision: 1 },
];
const columns: TableColumn<typeof rows[number]>[] = [
  { key: 'name', title: '交付物', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name, 'zh-CN') },
  { key: 'category', title: '类型', dataIndex: 'category', filters: ['文档', '设计'].map(value => ({ label: value, value })) },
  { key: 'revision', title: '版本', dataIndex: 'revision', sorter: (a, b) => a.revision - b.revision },
];

export default function DeliveryRecords() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', width: '100%' }}>
      <Input aria-label="搜索交付物" placeholder="搜索交付物" value={query} onChange={value => { setQuery(value); setPage(1); }} />
      <Table columns={columns} data={rows.filter(row => row.name.includes(query.trim()))} rowKey="name"
        pagination={{ page, pageSize: 2, onChange: setPage, showTotal: true }} />
    </div>
  );
}
