import { Button, Form, Input } from '@yuki-ui/react';

export default function BasicForm() {
  return (
    <Form
      layout="vertical"
      style={{ maxWidth: 360 }}
      initialValues={{ email: '', password: '' }}
      onFinish={(values) => {
        window.alert(`登录成功：${JSON.stringify(values)}`);
      }}
      onFinishFailed={(errors) => {
        if (errors[0]) window.alert(errors[0].message);
      }}
    >
      <Form.Item
        name="email"
        label="邮箱"
        extra="我们只会用它发送登录验证码。"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '邮箱格式不正确' },
        ]}
      >
        <Input placeholder="dev@yuki.design" />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少 6 位' },
        ]}
      >
        <Input type="password" placeholder="至少 6 位" />
      </Form.Item>
      <Form.Item>
        <Button type="submit">登录</Button>
      </Form.Item>
    </Form>
  );
}
