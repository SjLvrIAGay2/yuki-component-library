import { useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Icon } from '@yuki-ui/react';

export default function ShortcutDetails() {
  const [open, setOpen] = useState('');
  return (
    <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
      <AccordionItem value="keys">
        <AccordionTrigger indicator={<Icon name={open ? 'minus' : 'plus'} />}>键盘快捷键</AccordionTrigger>
        <AccordionContent forceMount>使用方向键移动，按 Enter 切换当前面板。</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
