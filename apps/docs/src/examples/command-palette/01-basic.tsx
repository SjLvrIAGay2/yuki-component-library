import { useState } from 'react';
import { Button, CommandPalette } from '@yuki-ui/react';

export default function ProjectCommands() {
  const [view, setView] = useState('概览');
  return <div>
    <CommandPalette title="打开项目视图" trigger={<Button>切换视图</Button>}
      items={[
        { id: 'overview', label: '概览', group: '工作台', keywords: ['overview'] },
        { id: 'files', label: '交付文件', group: '工作台', keywords: ['files'] },
        { id: 'archive', label: '归档记录', group: '管理', disabled: true },
      ]} onSelect={item => setView(item.label)} />
    <p aria-live="polite">当前视图为{view}</p>
  </div>;
}
