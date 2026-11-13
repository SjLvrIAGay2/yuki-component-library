import { Accordion } from '@yuki-ui/react';

const items = [
  { value: '1', title: '什么是设计 Token？', content: '设计 Token 是可复用的视觉决策变量，例如颜色、间距、圆角与动效。' },
  { value: '2', title: '如何覆盖组件样式？', content: '每个组件都在根节点声明组件级 Token，通过 classNames 与 style 即可局部覆盖。' },
  { value: '3', title: '支持深色模式吗？', content: '所有语义 Token 都会在深色模式下自动映射。' },
];

export default function BasicAccordion() {
  return <Accordion items={items} defaultValue={['1']} />;
}
