import { Breadcrumb, Icon, Space } from '@yuki-ui/react';

export default function BreadcrumbCustomDemo() {
  return (
    <Space direction="vertical" size="3">
      <Breadcrumb
        separator="›"
        items={[
          { title: '工作台', href: '/', icon: <Icon name="home" /> },
          { title: '项目', href: '/projects' },
          { title: '设计系统' },
        ]}
      />
      <Breadcrumb
        items={[
          { title: '文档', href: '/docs', icon: <Icon name="folder" /> },
          { title: '草稿（不可点击）', disabled: true },
          { title: '导航' },
        ]}
      />
    </Space>
  );
}
