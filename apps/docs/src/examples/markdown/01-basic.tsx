import { Markdown } from '@yuki-ui/react';

const text = [
  '### 发布前检查',
  '- [x] 更新版本号',
  '- [ ] 运行回归测试',
  '',
  '| 版本 | 状态 |',
  '| --- | --- |',
  '| v1.0 | 已发布 |',
  '| v1.1 | 待发布 |',
].join('\n');

export default function BasicMarkdown() {
  return <Markdown>{text}</Markdown>;
}
