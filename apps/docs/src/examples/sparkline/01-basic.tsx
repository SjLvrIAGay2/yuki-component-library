import { Flex, Sparkline, Statistic } from '@yuki-ui/react';

export default function WeeklyReviews() {
  return <Flex align="center" gap="4">
    <Statistic title="本周已审阅" value={32} />
    <Sparkline values={[18, 22, 19, null, 26, 29, 32]} label="近七天审阅量从 18 份增至 32 份，第四天缺少记录" />
  </Flex>;
}
