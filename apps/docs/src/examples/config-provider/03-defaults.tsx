import { Button, ConfigProvider, LocaleProvider, EmptyPage } from '@yuki-ui/react';

export default function ProjectDefaults() {
  return (
    <ConfigProvider global={false} density="compact" components={{ Button: { variant: 'outline' } }}>
      <LocaleProvider locale="zh-CN" messages={{ pageEmptyTitle: '还没有发布记录' }}>
        <EmptyPage actions={<Button onClick={() => window.print()}>打印当前页</Button>} />
      </LocaleProvider>
    </ConfigProvider>
  );
}
