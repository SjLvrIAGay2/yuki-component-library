import { TreeSelect, type TreeNodeOption } from '@yuki-ui/react';

const options: TreeNodeOption<string>[] = [
  {
    value: 'design',
    label: '设计部',
    children: [
      { value: 'ui', label: 'UI 组' },
      { value: 'ux', label: 'UX 组' },
    ],
  },
  {
    value: 'engineering',
    label: '研发部',
    children: [
      { value: 'frontend', label: '前端组' },
      { value: 'backend', label: '后端组' },
    ],
  },
  {
    value: 'empty',
    label: '外包团队',
    isLeaf: true,
  },
];

export default function CustomTreeSelect() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-lg)' }}>
      <TreeSelect
        label="所属部门"
        options={options}
        searchable
        defaultExpandAll
        placeholder="可搜索部门"
        renderNode={(node, state) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--yuki-space-2)' }}>
            <span>{node.label}</span>
            {state.leaf ? (
              <span style={{ color: 'var(--yuki-color-text-tertiary)', fontSize: 'var(--yuki-font-size-xs)' }}>
                成员
              </span>
            ) : null}
          </span>
        )}
      />
      <TreeSelect
        options={options}
        multiple
        defaultExpandAll
        defaultValue={['ui', 'frontend']}
        size="lg"
        placeholder="多选部门"
      />
    </div>
  );
}
