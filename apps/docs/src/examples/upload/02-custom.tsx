import { useState } from 'react';
import {
  Button,
  Icon,
  Upload,
  UploadDragger,
  type UploadFile,
  type UploadRequestOptions,
} from '@yuki-ui/react';

function simulateRequest(options: UploadRequestOptions) {
  let percent = 0;
  const timer = window.setInterval(() => {
    percent = Math.min(100, percent + 25);
    options.onProgress(percent);
    if (percent === 100) {
      window.clearInterval(timer);
      options.onSuccess();
    }
  }, 400);
  return { abort: () => window.clearInterval(timer) };
}

const coverSvg =
  'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2224%22 fill=%22%236366f1%22/%3E%3C/svg%3E';

export default function CustomUpload() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div style={{ display: 'grid', gap: 'var(--yuki-space-6)', maxWidth: 520 }}>
      <UploadDragger
        multiple
        accept="image/*"
        fileList={files}
        onChange={(next) => setFiles(next)}
        customRequest={simulateRequest}
        tip="拖拽或点击上传，图片会显示预览"
      />
      <Upload
        listType="picture"
        defaultFileList={[
          { uid: 'cover', name: 'cover.svg', status: 'done', url: coverSvg },
        ]}
        tip="图片列表模式"
      />
      <Upload>
        <Button variant="outline" startIcon={<Icon name="folder" />}>
          自定义触发器
        </Button>
      </Upload>
    </div>
  );
}
