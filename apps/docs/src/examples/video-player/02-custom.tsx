import { useState } from 'react';
import { VideoPlayer } from '@yuki-ui/react';

export default function LocalVideoExample() {
  const [file, setFile] = useState<File>();
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', width: '100%' }}>
      <label>选择本地视频 <input type="file" accept="video/*" onChange={(event) => setFile(event.target.files?.[0])} /></label>
      <VideoPlayer
        src={file ?? './samples/yuki-motion.webm'}
        title={file?.name ?? '动效演示'}
        controlOptions={{ skip: false }}
      />
    </div>
  );
}
