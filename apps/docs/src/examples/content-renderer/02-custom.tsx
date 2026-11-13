import { useState } from 'react';
import { ContentRenderer, Flex, Select, type ContentRendererProps } from '@yuki-ui/react';

const attachments: Array<{ label: string; content: ContentRendererProps }> = [
  { label: '说明文档', content: { type: 'document', src: './samples/yuki-readme.md' } },
  { label: '音乐', content: { type: 'audio', src: './samples/yuki-notes.wav' } },
  { label: '视频', content: { type: 'video', src: './samples/yuki-motion.webm', poster: './samples/yuki-motion.png' } },
  { label: '封面图', content: { type: 'image', src: './samples/yuki-motion.png', alt: '示例视频封面' } },
];

export default function AttachmentPreview() {
  const [index, setIndex] = useState(0);
  const attachment = attachments[index];
  return (
    <Flex direction="column" gap="3" style={{ width: '100%' }}>
      <Select value={index} onChange={(next) => setIndex(next ?? 0)}
        aria-label="选择附件" options={attachments.map(({ label }, value) => ({ label, value }))} />
      {attachment && <ContentRenderer {...attachment.content} />}
    </Flex>
  );
}
