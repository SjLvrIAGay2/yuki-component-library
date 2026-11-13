import { Statistic } from '@yuki-ui/react';

export default function BasicStatistic() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--yuki-space-8)',
      }}
    >
      <Statistic title="活跃用户" value={12480} />
      <Statistic title="转化率" value={0.1876} precision={2} suffix="%" />
      <Statistic title="营收" value={1289560} prefix="¥" precision={2} />
    </div>
  );
}
