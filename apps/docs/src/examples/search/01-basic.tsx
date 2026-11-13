import { Search } from '@yuki-ui/react';

export default function BasicSearch() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 420 }}>
      <Search placeholder="搜索组件…" onSearch={(value) => window.alert(`搜索：${value}`)} />
      <Search placeholder="按下回车触发 onSearch" defaultValue="Button" allowClear />
      <Search placeholder="禁用" disabled />
      <Search placeholder="小尺寸" size="sm" />
    </div>
  );
}
