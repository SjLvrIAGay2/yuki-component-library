import { useState } from 'react';
import { Animation, Button } from '@yuki-ui/react';

export default function ToggleDetails() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="outline" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '收起详情' : '查看详情'}</Button>
      <Animation open={open} animation={{ preset: 'slide', direction: 'down', distance: 8, duration: 180 }}>
        <p>此版本包含新的文档阅读和文件预览组件。</p>
      </Animation>
    </div>
  );
}
