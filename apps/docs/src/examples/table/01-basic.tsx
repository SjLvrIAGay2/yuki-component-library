import { Table } from '@yuki-ui/react';

interface Member {
  id: number;
  name: string;
  role: string;
  age: number;
  city: string;
}

const data: Member[] = [
  { id: 1, name: '林舟', role: '前端工程师', age: 27, city: '杭州' },
  { id: 2, name: '沈星', role: '设计师', age: 31, city: '上海' },
  { id: 3, name: '陈默', role: '产品经理', age: 29, city: '深圳' },
  { id: 4, name: '苏晚', role: '数据分析师', age: 26, city: '北京' },
  { id: 5, name: '顾言', role: '后端工程师', age: 34, city: '成都' },
];

export default function BasicTable() {
  return (
    <Table<Member>
      rowKey="id"
      columns={[
        { key: 'name', title: '姓名', dataIndex: 'name' },
        { key: 'role', title: '角色', dataIndex: 'role' },
        { key: 'age', title: '年龄', dataIndex: 'age', width: 96, align: 'right' },
        { key: 'city', title: '城市', dataIndex: 'city', width: 120 },
      ]}
      data={data}
      bordered
    />
  );
}
