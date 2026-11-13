import { Tabs } from '@yuki-ui/react';

const items = [
  { key: 'overview', label: '概览', children: '项目当前处于开发阶段，核心组件已完成 15 个。' },
  { key: 'activity', label: '动态', children: '最近 24 小时共有 3 次提交。' },
  { key: 'members', label: '成员', children: '设计 2 人、前端 3 人、测试 1 人。' },
];

export default function BasicTabs() {
  return <Tabs items={items} defaultValue="overview" />;
}
