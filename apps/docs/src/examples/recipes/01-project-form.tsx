import { useState } from 'react';
import { Button, Dialog, Form, Input, Select } from '@yuki-ui/react';

export default function ProjectForm() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{ name: string; visibility: string }>>([]);
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen} title="创建项目"
        description="同一工作区内的项目名称必须唯一。"
        trigger={<Button>创建项目</Button>}>
        <Form layout="vertical" initialValues={{ name: '', visibility: '团队' }}
          onFinish={({ name, visibility }) => {
            setProjects(current => [...current, { name: name.trim(), visibility }]);
            setOpen(false);
          }}>
          <Form.Item name="name" label="项目名称" validateTrigger="onBlur" rules={[
            { required: true, whitespace: true, message: '请填写项目名称' },
            { validator: async (name) => {
              const title = String(name ?? '').trim();
              if (title === '设计系统' || projects.some(project => project.name === title)) {
                throw new Error('此名称已被使用');
              }
            } },
          ]}>
            <Input placeholder="例如，冬季发布" />
          </Form.Item>
          <Form.Item name="visibility" label="访问范围">
            <Select options={['团队', '仅自己'].map(value => ({ value, label: value }))} />
          </Form.Item>
          <Button type="submit">保存项目</Button>
        </Form>
      </Dialog>
      {projects.length > 0 && <ul aria-label="已创建项目">{projects.map(project => <li key={project.name}>{project.name} · {project.visibility}</li>)}</ul>}
    </div>
  );
}
