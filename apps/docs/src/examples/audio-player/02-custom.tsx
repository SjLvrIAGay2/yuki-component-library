import { useState } from 'react';
import { AudioPlayer, Switch } from '@yuki-ui/react';

export default function AudioControlsExample() {
  const [native, setNative] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-3)', width: '100%' }}>
      <div>使用原生控件 <Switch aria-label="使用原生控件" checked={native} onChange={setNative} /></div>
      <AudioPlayer
        src="./samples/yuki-notes.wav"
        title="音轨预览"
        cover="./samples/yuki-motion.png"
        controlsVariant={native ? 'native' : 'custom'}
        playbackRates={[0.75, 1, 1.25, 1.5, 2]}
        controlOptions={{ skipSeconds: 5 }}
      />
    </div>
  );
}
