import { RangeSlider } from '@yuki-ui/react';

export default function PriceRange() {
  return <RangeSlider label="预算范围" defaultValue={[100, 350]} min={0} max={500} step={10}
    thumbLabels={['最低预算', '最高预算']} formatValue={value => `¥${value}`} showValue />;
}
