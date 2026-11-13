import { useState } from 'react';
import { Upload, type UploadFile } from '@yuki-ui/react';

export default function BasicUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)', maxWidth: 520 }}>
      <Upload
        fileList={files}
        onChange={(next) => setFiles(next)}
        multiple
        accept="image/*,.pdf"
        tip="支持图片与 PDF，可多选"
      />
      <Upload maxCount={2} accept="image/*" tip="最多上传 2 个文件" />
      <Upload size="sm" disabled tip="禁用状态" />
    </div>
  );
}
