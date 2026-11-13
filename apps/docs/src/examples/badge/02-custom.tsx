import { Badge, Icon } from '@yuki-ui/react';

const statuses: Array<{
  status: 'default' | 'processing' | 'success' | 'warning' | 'danger' | 'info';
  text: string;
}> = [
  { status: 'default', text: '草稿' },
  { status: 'processing', text: '同步中' },
  { status: 'success', text: '已发布' },
  { status: 'warning', text: '待审核' },
  { status: 'danger', text: '已失败' },
  { status: 'info', text: '已归档' },
];

const iconBox = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 'var(--yuki-radius-md)',
  background: 'var(--yuki-color-bg-subtle)',
  color: 'var(--yuki-color-text-secondary)',
};

export default function CustomBadge() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-5)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--yuki-space-4)',
        }}
      >
        {statuses.map((item) => (
          <Badge key={item.status} status={item.status} text={item.text} />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--yuki-space-6)',
        }}
      >
        <Badge count={8} color="var(--yuki-color-warning)" offset={[6, -2]}>
          <span style={iconBox}>
            <Icon name="bell" />
          </span>
        </Badge>
        <Badge count={99} size="sm">
          <span style={iconBox}>
            <Icon name="mail" />
          </span>
        </Badge>
        <Badge count={99} size="lg">
          <span style={iconBox}>
            <Icon name="inbox" />
          </span>
        </Badge>
      </div>
    </div>
  );
}
