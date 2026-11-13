import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@yuki-ui/react';

export default function ReleaseCard() {
  return (
    <Card>
      <CardHeader><CardTitle>发布记录</CardTitle><CardDescription>组件库更新</CardDescription></CardHeader>
      <CardContent>文档预览现已支持本地文件。</CardContent>
      <CardFooter>维护团队 · Yuki UI</CardFooter>
    </Card>
  );
}
