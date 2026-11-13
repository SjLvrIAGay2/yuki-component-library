import { Button, Form, Input } from '@yuki-ui/react';

export default function CustomForm() {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 440 }}
      initialValues={{ password: '', confirm: '', users: [{ name: '张一' }] }}
      onFinish={(values) => {
        window.alert(JSON.stringify(values, null, 2));
      }}
    >
      <Form.Item
        name="password"
        label="新密码"
        rules={[{ required: true, message: '请输入新密码' }]}
      >
        <Input type="password" placeholder="至少 6 位" />
      </Form.Item>
      <Form.Item
        name="confirm"
        label="确认密码"
        dependencies={['password']}
        rules={[
          { required: true, message: '请再次输入密码' },
          {
            validator: (value) =>
              value === form.getFieldValue('password')
                ? undefined
                : Promise.reject(new Error('两次输入的密码不一致')),
          },
        ]}
      >
        <Input type="password" placeholder="再输入一次" />
      </Form.Item>

      <Form.Item label="邀请成员" extra="依赖 Form.List，可动态增删。">
        <Form.List name="users">
          {(fields, { add, remove }) => (
            <div style={{ display: 'grid', gap: 'var(--yuki-space-2)' }}>
              {fields.map((field) => (
                <div
                  key={field.key}
                  style={{ display: 'flex', gap: 'var(--yuki-space-2)' }}
                >
                  <div style={{ flex: 1 }}>
                    <Form.Item
                      name={['users', field.name, 'name']}
                      rules={[{ required: true, message: '请输入成员姓名' }]}
                    >
                      <Input aria-label={`成员 ${field.name + 1} 姓名`} placeholder="成员姓名" />
                    </Form.Item>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    tone="danger"
                    onClick={() => remove(field.name)}
                  >
                    移除
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                tone="neutral"
                onClick={() => add({ name: '' })}
              >
                添加成员
              </Button>
            </div>
          )}
        </Form.List>
      </Form.Item>

      <Button type="submit">保存</Button>
    </Form>
  );
}
