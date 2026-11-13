import { useState } from 'react';
import { Table } from '@yuki-ui/react';

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  channel: 'web' | 'app' | 'store';
  note: string;
}

const orders: Order[] = [
  { id: 'A-1024', customer: '林舟', amount: 2680, status: 'paid', channel: 'web', note: '首单优惠' },
  { id: 'A-1025', customer: '沈星', amount: 920, status: 'pending', channel: 'app', note: '等待支付' },
  { id: 'A-1026', customer: '陈默', amount: 4500, status: 'paid', channel: 'store', note: '线下自提' },
  { id: 'A-1027', customer: '苏晚', amount: 128, status: 'refunded', channel: 'web', note: '已退款' },
  { id: 'A-1028', customer: '顾言', amount: 1760, status: 'paid', channel: 'app', note: '加急发货' },
  { id: 'A-1029', customer: '周蓝', amount: 640, status: 'pending', channel: 'store', note: '' },
];

const statusLabel: Record<Order['status'], string> = {
  paid: '已支付',
  pending: '待支付',
  refunded: '已退款',
};

const statusColor: Record<Order['status'], string> = {
  paid: 'var(--yuki-color-success)',
  pending: 'var(--yuki-color-warning)',
  refunded: 'var(--yuki-color-danger)',
};

const channelLabel: Record<Order['channel'], string> = {
  web: '网页',
  app: 'App',
  store: '门店',
};

export default function CustomTable() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['A-1024']);

  return (
    <Table<Order>
      rowKey="id"
      size="sm"
      bordered
      striped
      columns={[
        { key: 'id', title: '订单号', dataIndex: 'id', width: 120, fixed: 'left' },
        {
          key: 'customer',
          title: '客户',
          dataIndex: 'customer',
          width: 120,
        },
        {
          key: 'amount',
          title: '金额（元）',
          dataIndex: 'amount',
          align: 'right',
          width: 140,
          sortable: true,
          render: ({ value }) => (
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              ¥{(value as number).toLocaleString()}
            </span>
          ),
        },
        {
          key: 'status',
          title: '状态',
          dataIndex: 'status',
          width: 120,
          filters: [
            { label: '已支付', value: 'paid' },
            { label: '待支付', value: 'pending' },
            { label: '已退款', value: 'refunded' },
          ],
          render: ({ value }) => (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--yuki-space-1)',
                fontSize: 'var(--yuki-font-size-xs)',
                color: statusColor[value as Order['status']],
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '0.375rem',
                  height: '0.375rem',
                  borderRadius: 'var(--yuki-radius-full)',
                  background: 'currentColor',
                }}
              />
              {statusLabel[value as Order['status']]}
            </span>
          ),
        },
        {
          key: 'channel',
          title: '渠道',
          dataIndex: 'channel',
          width: 100,
          render: ({ value }) => channelLabel[value as Order['channel']],
        },
        {
          key: 'note',
          title: '备注',
          dataIndex: 'note',
          ellipsis: true,
          render: ({ value }) => (value ? String(value) : '—'),
        },
      ]}
      data={orders}
      pagination={{ pageSize: 4, showTotal: true }}
      rowSelection={{
        selectedRowKeys: selectedKeys,
        onChange: (keys) => setSelectedKeys(keys as string[]),
      }}
      expandable={{
        expandedRowRender: (row) => (
          <div style={{ display: 'flex', gap: 'var(--yuki-space-6)' }}>
            <span>订单号：{row.id}</span>
            <span>客户：{row.customer}</span>
            <span>备注：{row.note || '无'}</span>
          </div>
        ),
      }}
      footerRender={(rows) => (
        <span>
          共 {rows.length} 笔订单 · 已选 {selectedKeys.length} 笔
        </span>
      )}
    />
  );
}
