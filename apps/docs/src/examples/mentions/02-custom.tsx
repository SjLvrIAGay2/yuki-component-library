import { useState } from 'react';
import { Mentions, type MentionOption } from '@yuki-ui/react';

const tags: MentionOption[] = [
  { value: 'design', label: '# 设计' },
  { value: 'frontend', label: '# 前端' },
  { value: 'backend', label: '# 后端' },
  { value: 'release', label: '# 发布' },
];

const people: MentionOption[] = [
  { value: 'alice', label: 'Alice Chen' },
  { value: 'bob', label: 'Bob Li' },
  { value: 'carol', label: 'Carol Wang' },
  { value: 'dave', label: 'Dave Zhang' },
];

export default function CustomMentions() {
  const [value, setValue] = useState('');
  const [picked, setPicked] = useState('');

  const loadOptions = (keyword: string) =>
    Promise.resolve(
      people.filter((person) =>
        `${person.value} ${String(person.label)}`
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      ),
    );

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', maxWidth: 480 }}>
      <Mentions options={tags} prefix="#" placeholder="输入 # 引用标签" />
      <Mentions
        value={value}
        onChange={(next) => setValue(next)}
        loadOptions={loadOptions}
        onSelect={(option) => setPicked(option.value)}
        rows={2}
        size="lg"
        placeholder="异步加载成员，输入 @ 搜索"
      />
      <p
        style={{
          margin: 0,
          fontSize: 'var(--yuki-font-size-sm)',
          color: 'var(--yuki-color-text-secondary)',
        }}
      >
        已提及：{picked || '—'}
      </p>
      <Mentions disabled options={people} placeholder="禁用状态" />
    </div>
  );
}
