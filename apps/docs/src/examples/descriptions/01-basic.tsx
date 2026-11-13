import { Descriptions } from '@yuki-ui/react';

const items = [
  { key: 'name', label: '项目名称', children: 'Yuki UI' },
  { key: 'owner', label: '负责人', children: '李明' },
  { key: 'status', label: '状态', children: '开发中' },
  { key: 'version', label: '版本', children: '0.4.0' },
  { key: 'stack', label: '技术栈', children: 'React 18 + TypeScript' },
];

export default function BasicDescriptions() {
  return <Descriptions title="基本信息" items={items} column={3} />;
}
