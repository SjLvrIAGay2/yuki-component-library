import { CommandPalette } from '@yuki-ui/react';
import { pages } from '../lib/content';

const commands = pages.map(page => ({
  id: page.slug, label: page.title, keywords: [page.slug, page.description], group: page.group,
}));

export default function DocsCommandMenu({ open, onOpenChange, onNavigate }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (hash: string) => void;
}) {
  return <CommandPalette title="搜索文档" placeholder="搜索组件或用法" items={commands}
    open={open} onOpenChange={onOpenChange} onSelect={item => onNavigate('#/c/' + encodeURIComponent(item.id))} />;
}
