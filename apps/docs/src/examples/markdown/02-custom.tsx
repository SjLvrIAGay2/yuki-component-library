import { useState } from 'react';
import { Markdown, Textarea, Flex } from '@yuki-ui/react';

export default function EditableMarkdown() {
  const [source, setSource] = useState('### 使用方法\n\n```sh\nnpm run dev\n```');
  return (
    <Flex direction="column" gap="3" style={{ width: '100%' }}>
      <Textarea aria-label="Markdown 源文" value={source} onChange={setSource} rows={5} />
      <Markdown codeLineNumbers allowImages={false}>{source}</Markdown>
    </Flex>
  );
}
