import { useState } from 'react';
import { Transfer, type TransferItem } from '@yuki-ui/react';

const members: TransferItem[] = [
  { key: 'alice', title: 'Alice Chen', description: '产品设计' },
  { key: 'bob', title: 'Bob Li', description: '前端开发' },
  { key: 'carol', title: 'Carol Wang', description: '后端开发' },
  { key: 'dave', title: 'Dave Zhang', description: '测试' },
  { key: 'erin', title: 'Erin Sun', description: '运营' },
];

export default function BasicTransfer() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['carol']);

  return (
    <Transfer
      dataSource={members}
      targetKeys={targetKeys}
      onChange={(next) => setTargetKeys(next)}
      titles={['待选成员', '已选成员']}
      searchable
    />
  );
}
