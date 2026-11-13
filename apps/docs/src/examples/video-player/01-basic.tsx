import { VideoPlayer } from '@yuki-ui/react';

export default function VideoExample() {
  return (
    <VideoPlayer
      src="./samples/yuki-motion.webm"
      poster="./samples/yuki-motion.png"
      title="动效演示"
      tracks={[{ src: './samples/yuki-captions.vtt', srcLang: 'zh', label: '中文', default: true }]}
    />
  );
}
