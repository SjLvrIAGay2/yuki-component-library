import { useState } from 'react';
import { Mentions, type MentionOption } from '@yuki-ui/react';

const members: MentionOption[] = [
  { value: 'alice', label: 'Alice Chen' },
  { value: 'bob', label: 'Bob Li' },
  { value: 'carol', label: 'Carol Wang' },
  { value: 'dave', label: 'Dave Zhang' },
  { value: 'erin', label: 'Erin Sun', disabled: true },
];

export default function BasicMentions() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 480 }}>
      <Mentions
        value={value}
        onChange={(next) => setValue(next)}
        options={members}
        placeholder="输入 @ 提及成员"
      />
      <Mentions defaultValue="你好 " options={members} rows={2} placeholder="继续输入以提及" />
    </div>
  );
}
