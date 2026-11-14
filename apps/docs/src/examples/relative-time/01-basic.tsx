import { RelativeTime } from '@yuki-ui/react';

export default function ReviewHistory() {
  const generatedAt = Date.UTC(2026, 4, 12, 10);
  return <p>报告生成时，最近一次审阅在 <RelativeTime value={generatedAt - 7200000} now={generatedAt} />。</p>;
}
