import lake from '../../assets/alpine-lake.jpg';
import { Icon, Image } from '@yuki-ui/react';

export default function CustomImage() {
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)' }}>
      <Image
        src={lake}
        alt="山峰在湖面的倒影"
        width={320}
        height={180}
        fit="cover"
        preview
        mask={<span>查看大图</span>}
      />
      <Image
        src="./samples/yuki-motion.png"
        alt="动效封面"
        width={320}
        height={180}
        fallback={<Icon name="image" size={32} label="图片加载失败" />}
      />
      <Image
        src="data:image/png,invalid"
        alt="缺失图片"
        width={320}
        height={180}
        fallback={<span>图片加载失败</span>}
      />
    </div>
  );
}
