import { Textarea } from '@yuki-ui/react';

export default function CustomTextarea() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 420 }}>
      <Textarea label="描述" error="请至少填写 12 个字" defaultValue="这段描述太短了。" />
      <Textarea status="warning" placeholder="警告状态" />
      <Textarea size="sm" placeholder="小尺寸文本域" rows={2} />
      <Textarea size="lg" placeholder="大尺寸文本域" rows={4} />
      <Textarea disabled defaultValue="禁用的文本域" rows={2} />
    </div>
  );
}
