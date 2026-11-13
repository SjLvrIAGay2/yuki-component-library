import { Icon, Rate } from '@yuki-ui/react';

export default function CustomRate() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)' }}>
      <Rate allowHalf defaultValue={3.5} aria-label="精确到半星" />
      <Rate count={3} defaultValue={2} character={(index) => <span>第 {index} 名</span>} />
      <Rate defaultValue={2} character={<Icon name="heart" />} aria-label="喜欢程度" />
      <Rate allowHalf allowClear defaultValue={1.5} size="sm" aria-label="小尺寸评分" />
    </div>
  );
}
