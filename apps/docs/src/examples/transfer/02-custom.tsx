import { useState } from 'react';
import { Transfer, type TransferItem } from '@yuki-ui/react';

const services: TransferItem[] = [
  { key: 'api', title: 'API 网关', description: '鉴权与限流' },
  { key: 'auth', title: '认证服务', description: '账号与令牌' },
  { key: 'billing', title: '计费服务', description: '账单与额度' },
  { key: 'search', title: '搜索服务', description: '索引与召回' },
  { key: 'guest', title: '访客服务', description: '仅限内部试用' },
];

export default function CustomTransfer() {
  const [keys, setKeys] = useState<string[]>(['auth']);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Transfer
        dataSource={services}
        targetKeys={keys}
        onChange={(next) => setKeys(next)}
        searchable
        disabledKeys={['guest']}
        titles={['全部服务', '已接入']}
        renderItem={(item) => <strong>{item.title}</strong>}
      />
      <Transfer
        dataSource={services}
        defaultTargetKeys={['api', 'billing']}
        oneWay
        size="sm"
        titles={['可选', '已选']}
      />
    </div>
  );
}
