import lake from '../../assets/alpine-lake.jpg';
import { ImageViewer } from '@yuki-ui/react';

export default function ImageViewerExample() {
  return <ImageViewer src={lake} alt="山峰在湖面的倒影" />;
}
