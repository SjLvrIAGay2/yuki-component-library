import { Cascader, type CascaderOption } from '@yuki-ui/react';

interface Area {
  value: string;
  label: string;
  children?: Area[];
}

const options: CascaderOption<string>[] = [
  {
    value: 'huadong',
    label: '华东',
    children: [
      {
        value: 'zj',
        label: '浙江',
        children: [
          { value: 'hangzhou', label: '杭州' },
          { value: 'ningbo', label: '宁波' },
        ],
      },
      { value: 'js', label: '江苏' },
    ],
  },
  {
    value: 'huabei',
    label: '华北',
    children: [{ value: 'bj', label: '北京' }],
  },
];

export default function CustomCascader() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-lg)' }}>
      <Cascader
        options={options}
        searchable
        changeOnSelect
        placeholder="可搜索，选择任意层级即提交"
        displayRender={(labels) => <span>{labels.join(' › ')}</span>}
      />
      <Cascader
        options={options}
        renderOption={(option, state) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--yuki-space-1)' }}>
            {option.label}
            {state.expandable ? (
              <span style={{ color: 'var(--yuki-color-text-tertiary)', fontSize: 'var(--yuki-font-size-xs)' }}>
                {state.depth + 1} 级
              </span>
            ) : null}
          </span>
        )}
        placeholder="自定义选项内容"
        size="lg"
      />
    </div>
  );
}
