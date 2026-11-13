import { List } from '@yuki-ui/react';

interface Member {
  id: number;
  name: string;
  description: string;
  extra: string;
}

const data: Member[] = [
  { id: 1, name: '林舟', description: '前端工程师 · 杭州', extra: '在线' },
  { id: 2, name: '沈星', description: '设计师 · 上海', extra: '忙碌' },
  { id: 3, name: '陈默', description: '产品经理 · 深圳', extra: '离线' },
  { id: 4, name: '苏晚', description: '数据分析师 · 北京', extra: '在线' },
];

export default function BasicList() {
  return (
    <List
      items={data}
      rowKey="id"
      header={<span>项目成员</span>}
      footer={<span>共 {data.length} 位成员</span>}
      bordered
    />
  );
}
