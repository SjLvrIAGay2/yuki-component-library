import { useState, type CSSProperties } from 'react';
import { ConfigProvider, Select } from '@yuki-ui/react';

const groups = [
  {
    label: '前端',
    options: [
      { value: 'react', label: 'React', description: '函数组件与 Hooks' },
      { value: 'vue', label: 'Vue', description: '组合式 API' },
    ],
  },
  {
    label: '后端',
    options: [
      { value: 'node', label: 'Node.js', description: '服务端运行时' },
      { value: 'go', label: 'Go', description: '高并发服务' },
    ],
  },
];

export default function CustomSelect() {
  const [value, setValue] = useState<string | null>('react');

  return (
    <ConfigProvider
      global={false}
      theme={{ primaryColor: '#0f766e', tokens: { 'radius-md': '10px' } }}
    >
      <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-sm)' }}>
        <Select
          options={groups}
          value={value}
          onChange={(next) => setValue(next)}
          searchable
          clearable
          placeholder="搜索技术栈"
          renderOption={(option, state) => (
            <span style={{ display: 'grid', gap: 'var(--yuki-space-0-5)' }}>
              <span>{option.label}</span>
              {option.description ? (
                <span
                  style={{
                    color: 'var(--yuki-color-text-secondary)',
                    fontSize: 'var(--yuki-font-size-xs)',
                  }}
                >
                  {option.description}
                </span>
              ) : null}
              {state.selected ? <span style={{ color: 'var(--yuki-color-primary)' }}>已选择</span> : null}
            </span>
          )}
          style={{ '--yuki-select-min-width': 'var(--yuki-popup-width-sm)' } as CSSProperties}
        />
        <Select
          options={groups}
          searchable
          searchPlaceholder="筛选技术栈"
          label="技术栈"
          error="请选择前端技术栈"
          placeholder="错误状态"
          defaultValue="go"
        />
        <Select
          aria-label="音轨"
          popupWidth="content"
          defaultValue="original"
          options={[
            { value: 'original', label: '原音' },
            { value: 'commentary', label: '导演与摄影师的完整制作解说' },
          ]}
          style={{ width: 'var(--yuki-space-24)' }}
        />
      </div>
    </ConfigProvider>
  );
}
