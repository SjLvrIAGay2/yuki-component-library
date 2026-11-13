import { Breadcrumb } from '@yuki-ui/react';

export default function BreadcrumbBasicDemo() {
  return (
    <Breadcrumb
      items={[
        { title: '首页', href: '/' },
        { title: '组件', href: '/components' },
        { title: '面包屑' },
      ]}
    />
  );
}
