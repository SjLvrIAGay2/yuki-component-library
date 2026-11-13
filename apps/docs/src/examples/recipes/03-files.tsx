import { useState } from 'react';
import { ContentRenderer, EmptyState, Upload, type UploadFile } from '@yuki-ui/react';

export default function FileReview() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const file = files[0]?.originFile;
  let preview = <EmptyState title="选择文件以预览" description="支持文档、图片、音频和视频。" />;
  if (file) {
    if (file.type.startsWith('image/')) preview = <ContentRenderer type="image" src={file} alt={file.name} />;
    else if (file.type.startsWith('audio/')) preview = <ContentRenderer type="audio" src={file} title={file.name} />;
    else if (file.type.startsWith('video/')) preview = <ContentRenderer type="video" src={file} title={file.name} />;
    else preview = <ContentRenderer type="document" src={file} filename={file.name} />;
  }
  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-4)', width: '100%', minWidth: 0 }}>
      <Upload accept=".pdf,.docx,.md,.txt,.csv,.json,image/*,audio/*,video/*" maxCount={1} fileList={files} onChange={setFiles}
        tip="文件仅在本地预览。" />
      {preview}
    </div>
  );
}
