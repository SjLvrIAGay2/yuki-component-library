import { Avatar, AvatarGroup, Icon } from '@yuki-ui/react';

const members = [
  { name: '李明', src: 'https://i.pravatar.cc/80?img=12' },
  { name: '王芳', src: 'https://i.pravatar.cc/80?img=47' },
  { name: '陈默', src: 'https://i.pravatar.cc/80?img=15' },
  { name: '赵宇', src: 'https://i.pravatar.cc/80?img=33' },
  { name: '孙可', src: 'https://i.pravatar.cc/80?img=24' },
];

export default function CustomAvatar() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)' }}>
      <AvatarGroup maxCount={4}>
        {members.map((member) => (
          <Avatar key={member.name} src={member.src} alt={member.name} />
        ))}
      </AvatarGroup>
      <AvatarGroup
        maxCount={2}
        overflowRender={(rest) => <span>+{rest}</span>}
      >
        {members.map((member) => (
          <Avatar key={member.name} src={member.src} alt={member.name} />
        ))}
      </AvatarGroup>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--yuki-space-3)',
        }}
      >
        <Avatar
          size={28}
          shape="square"
          src="https://i.pravatar.cc/80?img=5"
          alt="小尺寸"
        />
        <Avatar size={40} icon={<Icon name="user" />} />
        <Avatar size={64} src="https://i.pravatar.cc/80?img=60" alt="大尺寸" />
      </div>
    </div>
  );
}
