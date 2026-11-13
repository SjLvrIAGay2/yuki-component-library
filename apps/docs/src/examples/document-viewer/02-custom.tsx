import { useRef, useState } from 'react';
import { Button, DocumentViewer, Flex } from '@yuki-ui/react';

export default function LocalDocument() {
  const [file, setFile] = useState<File>();
  const input = useRef<HTMLInputElement>(null);
  return (
    <Flex direction="column" align="start" gap="3" style={{ width: '100%' }}>
      <Button variant="outline" onClick={() => input.current?.click()}>选择本地文档</Button>
      <input ref={input} type="file" hidden aria-label="本地文档"
        onChange={(event) => setFile(event.currentTarget.files?.[0])} />
      <DocumentViewer src={file} maxRenderedLines={200} />
    </Flex>
  );
}
