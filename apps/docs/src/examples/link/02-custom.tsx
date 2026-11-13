import { Link, Text } from '@yuki-ui/react';

export default function CustomLink() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Text>
        外链会自动获得标记与安全属性：{' '}
        <Link href="https://example.com" external>
          在 example.com 查看规范
        </Link>
      </Text>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--yuki-space-4)' }}>
        <Link href="#" size="sm">
          小号链接
        </Link>
        <Link href="#" size="md">
          中号链接
        </Link>
        <Link href="#" size="lg">
          大号链接
        </Link>
        <Link href="#" disabled>
          已禁用
        </Link>
        <Link href="#" icon={<span aria-hidden>↗</span>}>
          自定义图标
        </Link>
      </div>
    </div>
  );
}
