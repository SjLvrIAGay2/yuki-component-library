import { useState } from 'react';
import { Checkbox, Table } from '@yuki-ui/react';

const records = [{ id: 1, name: '设计稿', owner: '林夏' }, { id: 2, name: '用研记录', owner: '陈安' }];

export default function VisibleColumns() {
  const [showOwner, setShowOwner] = useState(true);
  return <div>
    <Checkbox checked={showOwner} onChange={setShowOwner}>显示负责人</Checkbox>
    <Table rowKey="id" data={records} columnVisibility={{ owner: showOwner }} columns={[
      { dataIndex: 'name', title: '交付物' }, { dataIndex: 'owner', title: '负责人', sortable: true },
    ]} />
  </div>;
}
