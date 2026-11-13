import { Avatar, AvatarGroup } from '@yuki-ui/react';

export default function TeamPresence() {
  return (
    <AvatarGroup overlap={4} aria-label="团队成员状态">
      <Avatar alt="林舟" status="online" />
      <Avatar alt="陈默" status="busy" />
      <Avatar alt="沈星" status="offline" />
    </AvatarGroup>
  );
}
