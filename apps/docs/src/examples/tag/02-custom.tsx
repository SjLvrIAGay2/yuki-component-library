import { useState } from 'react';
import { Icon, Tag } from '@yuki-ui/react';

const categories = ['设计', '前端', '文档'];

export default function CustomTag() {
  const [checked, setChecked] = useState<string[]>(['设计']);
  const [visible, setVisible] = useState<string[]>(['可关闭', '带图标']);

  const toggle = (name: string) => {
    setChecked((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)' }}>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-2)' }}
      >
        {categories.map((name) => (
          <Tag
            key={name}
            checkable
            tone="primary"
            icon={<Icon name="check" />}
            checked={checked.includes(name)}
            onCheckedChange={() => toggle(name)}
          >
            {name}
          </Tag>
        ))}
      </div>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-2)' }}
      >
        {visible.map((name) => (
          <Tag
            key={name}
            shape="round"
            tone="success"
            closable
            onClose={() =>
              setVisible((prev) => prev.filter((item) => item !== name))
            }
          >
            {name}
          </Tag>
        ))}
        <Tag size="sm">小号</Tag>
        <Tag size="lg">大号</Tag>
      </div>
    </div>
  );
}
