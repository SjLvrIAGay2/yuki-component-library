import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@yuki-ui/react';

export default function ProjectAccess() {
  return (
    <Accordion type="multiple" defaultValue={['viewer']}>
      <AccordionItem value="viewer">
        <AccordionTrigger>查看者</AccordionTrigger>
        <AccordionContent>可以查看项目文件和发布记录。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="editor">
        <AccordionTrigger>编辑者</AccordionTrigger>
        <AccordionContent>可以更新文件、邀请成员和创建发布版本。</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
