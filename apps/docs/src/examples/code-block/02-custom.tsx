import { useState } from 'react';
import { CodeBlock, Flex, Checkbox } from '@yuki-ui/react';

const query = 'SELECT title, published_at, author_name FROM articles WHERE published = true ORDER BY published_at DESC;';

export default function CustomCodeBlock() {
  const [wrap, setWrap] = useState(true);
  return (
    <Flex direction="column" gap="3" style={{ width: '100%' }}>
      <Checkbox checked={wrap} onChange={setWrap}>自动换行</Checkbox>
      <CodeBlock code={query} language="sql" filename="articles.sql" wrap={wrap} startLine={18} />
    </Flex>
  );
}
