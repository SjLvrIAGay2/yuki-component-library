import { Button, Result, Space } from '@yuki-ui/react';

export default function CustomResult() {
  return (
    <Space wrap size="8" align="start">
      <Result
        status="403"
        title="无权访问该页面"
        subTitle="请联系管理员申请「发布管理」权限。"
        extra={<Button variant="outline">申请权限</Button>}
      />
      <Result
        status="404"
        title="页面不存在"
        subTitle="链接可能已失效，或内容已被移动到其他位置。"
        extra={<Button>回到首页</Button>}
      />
      <Result
        status="500"
        title="服务器开小差了"
        subTitle="我们已收到错误报告，请稍后重试。"
        size="sm"
        extra={<Button variant="ghost">重试</Button>}
      />
    </Space>
  );
}
