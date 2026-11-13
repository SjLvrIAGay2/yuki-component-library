import { Textarea } from '@yuki-ui/react';

export default function BasicTextarea() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', maxWidth: 420 }}>
      <Textarea placeholder="写点备注…" rows={3} />
      <Textarea defaultValue="随内容自动增高的文本域。" autoSize />
      <Textarea
        placeholder="带字数统计"
        maxLength={100}
        showCount
        allowClear
        autoSize={{ minRows: 2, maxRows: 5 }}
      />
    </div>
  );
}
