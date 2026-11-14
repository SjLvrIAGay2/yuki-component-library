import { ImageComparison } from '@yuki-ui/react';

function elevationProfile(points: string) {
  const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100"><rect width="320" height="100" fill="#eef1f6"/><path d="M0,100 L${points} L320,100Z" fill="#697b98"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(image);
}

export default function RouteComparison() {
  return <ImageComparison defaultValue={55}
    before={{ src: elevationProfile('0,68 70,30 140,54 210,18 320,60'), alt: '旧路线途经两个山峰' }}
    after={{ src: elevationProfile('0,68 70,48 140,54 210,38 320,60'), alt: '新路线绕开了两处山峰' }}
    label="路线高程对比" caption="拖动分界线查看路线调整前后的高程。" />;
}
