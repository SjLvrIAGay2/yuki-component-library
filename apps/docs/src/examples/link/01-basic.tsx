import { Link, Text } from '@yuki-ui/react';

export default function BasicLink() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Text>
        阅读 <Link href="#/c/typography">排版指南</Link> 了解字号阶梯，或查看{' '}
        <Link href="#/tokens">设计令牌</Link>。
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-4)' }}>
        <Link href="#" underline="always">
          始终下划线
        </Link>
        <Link href="#" underline="hover">
          悬停下划线
        </Link>
        <Link href="#" underline="none">
          无下划线
        </Link>
        <Link href="#" tone="subtle">
          低调链接
        </Link>
        <Link href="#" tone="danger">
          危险操作
        </Link>
      </div>
    </div>
  );
}
