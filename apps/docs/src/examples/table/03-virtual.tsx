import { Table } from '@yuki-ui/react';

interface LogRow {
  id: number;
  time: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
}

const levels: LogRow['level'][] = ['info', 'warn', 'error'];
const services = ['gateway', 'auth', 'billing', 'search', 'scheduler'];

const data: LogRow[] = Array.from({ length: 1000 }, (_, index) => {
  const minute = String(index % 60).padStart(2, '0');
  const second = String((index * 7) % 60).padStart(2, '0');
  return {
    id: index + 1,
    time: `12:${minute}:${second}`,
    level: levels[index % levels.length] as LogRow['level'],
    service: services[index % services.length] as string,
    message:
      index % 7 === 0
        ? '请求耗时超过阈值，已自动降级并记录慢查询。'
        : `处理请求 #${index + 1}，状态正常。`,
  };
});

const levelColor: Record<LogRow['level'], string> = {
  info: 'var(--yuki-color-info)',
  warn: 'var(--yuki-color-warning)',
  error: 'var(--yuki-color-danger)',
};

export default function VirtualTable() {
  return (
    <Table<LogRow>
      rowKey="id"
      size="sm"
      striped
      virtual
      rowHeight={40}
      scroll={{ y: 320, x: 760 }}
      columns={[
        { key: 'id', title: 'ID', dataIndex: 'id', width: 80, fixed: 'left', align: 'right' },
        { key: 'time', title: '时间', dataIndex: 'time', width: 100 },
        {
          key: 'level',
          title: '级别',
          dataIndex: 'level',
          width: 90,
          render: ({ value }) => (
            <span
              style={{
                color: levelColor[value as LogRow['level']],
                textTransform: 'uppercase',
                fontSize: 'var(--yuki-font-size-2xs)',
                fontWeight: 'var(--yuki-font-weight-semibold)',
              }}
            >
              {String(value)}
            </span>
          ),
        },
        { key: 'service', title: '服务', dataIndex: 'service', width: 120 },
        { key: 'message', title: '消息', dataIndex: 'message', width: 520, ellipsis: true },
      ]}
      data={data}
      pagination={false}
      footerRender={(rows) => <span>已渲染 {rows.length} 条日志（虚拟滚动）</span>}
    />
  );
}
