import { useState } from 'react';
import { Button, DocumentViewer, Flex } from '@yuki-ui/react';

const samples = [
  { label: 'PDF', path: './samples/yuki-guide.pdf' },
  { label: 'Word', path: './samples/yuki-guide.docx' },
  { label: 'Markdown', path: './samples/yuki-readme.md' },
];

export default function SampleDocuments() {
  const [src, setSrc] = useState('./samples/yuki-guide.pdf');
  return (
    <Flex direction="column" gap="3" style={{ width: '100%' }}>
      <Flex gap="2" wrap>
        {samples.map(({ label, path }) => (
          <Button key={path} size="sm" aria-pressed={src === path}
            variant={src === path ? 'soft' : 'outline'} onClick={() => setSrc(path)}>
            {label}
          </Button>
        ))}
      </Flex>
      <DocumentViewer src={src} />
    </Flex>
  );
}
