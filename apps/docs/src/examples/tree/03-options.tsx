import { Tree, type TreeOption } from '@yuki-ui/react';

const options: TreeOption[] = [
  { value: 'active', label: '进行中', children: [{ value: 'library', label: '组件库' }] },
  { value: 'archive', label: '已归档', disabled: true, children: [{ value: 'beta', label: '内测项目' }] },
];

export default function ProjectDirectory() {
  return <Tree options={options} defaultExpandAll defaultValue="library" aria-label="项目目录" />;
}
