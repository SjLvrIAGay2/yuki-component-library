import { Avatar, Icon } from '@yuki-ui/react';

export default function BasicAvatar() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--yuki-space-3)',
      }}
    >
      <Avatar src="https://i.pravatar.cc/80?img=12" alt="李明" />
      <Avatar>小明</Avatar>
      <Avatar icon={<Icon name="user" />} />
      <Avatar fallback="访客" />
      <Avatar
        size={48}
        shape="square"
        src="https://i.pravatar.cc/80?img=32"
        alt="设计团队"
      />
    </div>
  );
}
