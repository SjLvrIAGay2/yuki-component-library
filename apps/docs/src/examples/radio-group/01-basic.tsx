import { RadioGroup } from '@yuki-ui/react';

export default function Permissions() {
  return (
    <RadioGroup label="成员权限" orientation="vertical" defaultValue="read" options={[
      { value: 'read', label: '查看', description: '可以打开和下载文件。' },
      { value: 'write', label: '编辑', description: '还可以修改项目内容。' },
    ]} />
  );
}
