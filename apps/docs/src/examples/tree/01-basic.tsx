import { useState } from 'react';
import { Tree } from '@yuki-ui/react';

interface Dept {
  key: string;
  title: string;
  children?: Dept[];
}

const treeData: Dept[] = [
  {
    key: 'design',
    title: '设计中心',
    children: [
      { key: 'design-ui', title: 'UI 设计' },
      { key: 'design-ux', title: '交互设计' },
      {
        key: 'design-brand',
        title: '品牌设计',
        children: [
          { key: 'design-brand-vi', title: '视觉识别' },
          { key: 'design-brand-motion', title: '动效规范' },
        ],
      },
    ],
  },
  {
    key: 'engineering',
    title: '研发中心',
    children: [
      {
        key: 'engineering-web',
        title: '前端团队',
        children: [
          { key: 'engineering-web-core', title: '基础架构' },
          { key: 'engineering-web-business', title: '业务开发' },
        ],
      },
      { key: 'engineering-server', title: '服务端团队' },
    ],
  },
  {
    key: 'product',
    title: '产品中心',
    children: [
      { key: 'product-growth', title: '增长产品' },
      { key: 'product-platform', title: '平台产品' },
    ],
  },
];

export default function BasicTree() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['engineering-web-core']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Tree
        treeData={treeData}
        defaultExpandAll
        selectedKeys={selectedKeys}
        onSelect={(keys) => setSelectedKeys(keys as string[])}
      />
      <span style={{ fontSize: 'var(--yuki-font-size-sm)', color: 'var(--yuki-color-text-secondary)' }}>
        当前选中：{selectedKeys.length > 0 ? selectedKeys.join('、') : '无'}
      </span>
    </div>
  );
}
