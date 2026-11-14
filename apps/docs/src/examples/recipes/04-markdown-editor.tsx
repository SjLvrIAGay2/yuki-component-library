import { useState } from 'react';
import { Grid, Markdown, Textarea } from '@yuki-ui/react';

export default function MarkdownEditor() {
  const [source, setSource] = useState('## 交付说明\n\n- 已完成键盘导航');
  return <Grid columns={2} gap="4">
    <Textarea label="Markdown 源文" autoSize={{ minRows: 5, maxRows: 14 }} value={source} onChange={setSource} />
    <section aria-label="预览"><Markdown>{source}</Markdown></section>
  </Grid>;
}
