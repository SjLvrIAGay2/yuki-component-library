import { Button, ToastProvider, useToast } from '@yuki-ui/react';

function SaveChanges() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: '更改已保存', description: '团队成员将在下一次打开项目时看到更新。', variant: 'success' })}>保存更改</Button>;
}

export default function ProjectNotice() {
  return <ToastProvider position="bottom-right" duration={5000} maxToasts={3}><SaveChanges /></ToastProvider>;
}
