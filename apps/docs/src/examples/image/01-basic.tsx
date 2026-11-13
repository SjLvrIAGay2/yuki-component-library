import lake from '../../assets/alpine-lake.jpg';
import { Image } from '@yuki-ui/react';

export default function BasicImage() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-4)' }}>
      <Image src={lake} alt="山间湖泊" width={240} height={150} />
      <Image src="./samples/yuki-motion.png" alt="动效封面" width={240} height={150} preview />
    </div>
  );
}
