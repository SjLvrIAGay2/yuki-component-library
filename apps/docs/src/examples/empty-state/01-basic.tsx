import { useState } from 'react';
import { Button, EmptyState } from '@yuki-ui/react';

export default function ProjectFilter() {
  const [filtered, setFiltered] = useState(true);
  return filtered ? (
    <EmptyState title="没有匹配的项目" description="当前仅显示已归档的项目。"
      action={<Button variant="outline" onClick={() => setFiltered(false)}>清除筛选</Button>} />
  ) : <div><p>设计系统</p><Button variant="ghost" onClick={() => setFiltered(true)}>仅看已归档</Button></div>;
}
