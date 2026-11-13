import { Badge, Button } from '@yuki-ui/react';

export default function BasicBadge() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--yuki-space-6)',
      }}
    >
      <Badge count={5}>
        <Button variant="soft">收件箱</Button>
      </Badge>
      <Badge count={128} max={99}>
        <Button variant="soft">通知</Button>
      </Badge>
      <Badge dot>
        <Button variant="soft">消息</Button>
      </Badge>
      <Badge count={0} showZero>
        <Button variant="outline">待办</Button>
      </Badge>
      <Badge status="success" text="服务正常" />
      <Badge status="danger" text="5 条告警" />
    </div>
  );
}
