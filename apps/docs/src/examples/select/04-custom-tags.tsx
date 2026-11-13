import { useState } from 'react';
import { Select } from '@yuki-ui/react';

const options = [
  { value: 'a11y', label: '无障碍', description: '键盘与读屏支持' },
  { value: 'tokens', label: '设计令牌', description: '颜色 / 间距 / 字号' },
  { value: 'motion', label: '动效', description: '过渡与手势' },
  { value: 'ssr', label: 'SSR', description: '服务端渲染', disabled: true },
];

export default function CustomMultiSelect() {
  const [value, setValue] = useState<string[]>(['a11y']);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 'var(--yuki-popup-width-md)' }}>
      <Select
        multiple
        options={options}
        value={value}
        onChange={setValue}
        searchable
        clearable
        maxTagCount={3}
        placeholder="选择能力"
        renderOption={(option, state) => (
          <span style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--yuki-space-3)' }}>
            <span>{option.label}</span>
            <span style={{ color: 'var(--yuki-color-text-tertiary)', fontSize: 'var(--yuki-font-size-xs)' }}>
              {state.selected ? '已选' : option.description}
            </span>
          </span>
        )}
        renderTag={(option, remove) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--yuki-space-1)',
              padding: 'var(--yuki-space-0-5) var(--yuki-space-1-5)',
              borderRadius: 'var(--yuki-radius-full)',
              background: 'var(--yuki-color-primary-subtle)',
              color: 'var(--yuki-color-primary)',
              fontSize: 'var(--yuki-font-size-xs)',
            }}
          >
            {option.label}
            {remove ? (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); remove(); }}
                aria-label={`移除 ${option.label}`}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ×
              </button>
            ) : null}
          </span>
        )}
      />
      <Select
        multiple
        options={options}
        defaultValue={['tokens', 'motion']}
        size="lg"
        placeholder="大尺寸"
        name="capabilities"
        required
      />
    </div>
  );
}
