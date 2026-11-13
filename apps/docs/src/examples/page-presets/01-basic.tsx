import { useState } from 'react';
import { Button, EmptyPage, ErrorPage, LoadingPage, MaintenancePage, OfflinePage, RedirectPage, ResultPage, Space } from '@yuki-ui/react';

const states = ['错误', '空结果', '处理结果', '加载', '维护', '离线', '跳转'] as const;
type State = typeof states[number];

export default function PageStates() {
  const [state, setState] = useState<State>('错误');
  const [online, setOnline] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const preset = {
    错误: <ErrorPage statusCode={404} primaryAction={{ label: '返回项目', onClick: () => setState('空结果') }} />,
    空结果: <EmptyPage reason="no-results" />,
    处理结果: <ResultPage status="success" />,
    加载: <LoadingPage value={45} onCancel={() => setState('空结果')} />,
    维护: <MaintenancePage recoveryTime="18:00" onRetry={() => setState('处理结果')} />,
    离线: <OfflinePage online={online} onReconnect={() => setOnline(true)} />,
    跳转: <RedirectPage href="#/c/button" onNavigate={(href) => { window.location.hash = href; }} />,
  };
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', width: '100%' }}>
      <Space wrap>
        {states.map((name) => (
          <Button key={name} size="sm" variant={name === state ? 'soft' : 'ghost'} aria-pressed={name === state}
            onClick={() => { setState(name); setOnline(false); setRefresh((n) => n + 1); }}>
            {name}
          </Button>
        ))}
      </Space>
      <div key={refresh}>{preset[state]}</div>
    </div>
  );
}
