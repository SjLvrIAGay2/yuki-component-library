import { Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@yuki-ui/react';

export default function DraftTabs() {
  return (
    <Tabs defaultValue="draft">
      <TabsList aria-label="草稿编辑"><TabsTrigger value="draft">草稿</TabsTrigger><TabsTrigger value="history">历史</TabsTrigger></TabsList>
      <TabsContent value="draft" forceMount><Input aria-label="草稿标题" placeholder="输入标题，再切换标签" /></TabsContent>
      <TabsContent value="history">暂无历史版本</TabsContent>
    </Tabs>
  );
}
