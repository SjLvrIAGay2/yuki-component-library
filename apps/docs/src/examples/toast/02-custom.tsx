import { useRef } from 'react';
import { Button, Space, ToastProvider, useToast } from '@yuki-ui/react';

function QueueActions() {
  const { toast, dismiss } = useToast();
  const latest = useRef<string>();
  return <Space wrap>
    <Button onClick={() => { latest.current = toast({ title: '正在等待审阅', duration: Infinity }); }}>添加提醒</Button>
    <Button variant="outline" onClick={() => { if (latest.current) dismiss(latest.current, { animate: true }); }}>移除最近提醒</Button>
  </Space>;
}

export default function ReviewQueue() {
  return <ToastProvider position="bottom-center" maxToasts={2}><QueueActions /></ToastProvider>;
}
