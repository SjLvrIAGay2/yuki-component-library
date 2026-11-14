import { useState } from 'react';
import { Button, List } from '@yuki-ui/react';

const records = Array.from({ length: 60 }, (_, i) => ({ id: i + 1, name: '审阅记录 ' + (i + 1) }));

export default function MoreRecords() {
  const [count, setCount] = useState(12);
  const loadMore = count < records.length ? () => setCount(n => Math.min(n + 12, records.length)) : undefined;
  return <List rowKey="id" items={records.slice(0, count)} renderItem={item => item.name}
    virtual={{ height: 180, itemSize: 34 }} onEndReached={loadMore}
    footer={loadMore ? <Button size="sm" onClick={loadMore}>加载更多</Button> : '已显示全部记录'} />;
}
