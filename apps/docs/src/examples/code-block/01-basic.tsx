import { CodeBlock } from '@yuki-ui/react';

const source = [
  'import { Button } from "@yuki-ui/react";',
  '',
  'export const Save = () => <Button>保存</Button>;',
].join('\n');

export default function BasicCodeBlock() {
  return <CodeBlock code={source} language="tsx" filename="Save.tsx" highlightLines={[3]} />;
}
