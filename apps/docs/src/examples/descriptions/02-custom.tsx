import { Descriptions, Tag } from '@yuki-ui/react';

const items = [
  { key: 'order', label: '订单号', children: 'YK-20241108-0042' },
  { key: 'amount', label: '金额', children: '¥ 1,286.00' },
  {
    key: 'status',
    label: '状态',
    children: <Tag tone="success">已支付</Tag>,
  },
  { key: 'address', label: '收货地址', children: '上海市浦东新区世纪大道 100 号', span: 2 },
  { key: 'remark', label: '备注', children: '工作日送货' },
];

export default function CustomDescriptions() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)' }}>
      <Descriptions
        title="订单详情"
        extra={<Tag tone="primary">加急</Tag>}
        items={items}
        column={3}
        bordered
      />
      <Descriptions
        items={items}
        column={2}
        layout="vertical"
        bordered
        colon={false}
        labelRender={(item) => <strong>{item.label}</strong>}
      />
    </div>
  );
}
