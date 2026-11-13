import { Button, List } from '@yuki-ui/react';

interface Project {
  id: number;
  name: string;
  description: string;
  owner: string;
  progress: number;
}

const projects: Project[] = [
  { id: 1, name: '设计系统 2.0', description: '统一 Token、主题与组件 API', owner: '林舟', progress: 72 },
  { id: 2, name: '数据看板', description: '实时指标与自助取数', owner: '苏晚', progress: 45 },
  { id: 3, name: '移动端重构', description: '性能优化与新交互落地', owner: '顾言', progress: 88 },
  { id: 4, name: '增长实验平台', description: 'A/B 实验配置与观测', owner: '陈默', progress: 23 },
];

export default function CustomList() {
  return (
    <List<Project>
      items={projects}
      rowKey="id"
      grid={{ columns: 2, gutter: 4 }}
      pagination={{ pageSize: 2, showTotal: true }}
      renderItem={(project) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--yuki-space-2)',
            padding: 'var(--yuki-space-4)',
            border: '1px solid var(--yuki-color-border-subtle)',
            borderRadius: 'var(--yuki-radius-md)',
            background: 'var(--yuki-color-bg-surface)',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 'var(--yuki-font-size-sm)' }}>{project.name}</strong>
            <span style={{ fontSize: 'var(--yuki-font-size-xs)', color: 'var(--yuki-color-text-tertiary)' }}>
              {project.progress}%
            </span>
          </div>
          <span style={{ fontSize: 'var(--yuki-font-size-xs)', color: 'var(--yuki-color-text-secondary)' }}>
            {project.description}
          </span>
          <div
            role="progressbar"
            aria-valuenow={project.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              height: '0.25rem',
              borderRadius: 'var(--yuki-radius-full)',
              background: 'var(--yuki-color-bg-muted)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'block',
                width: `${project.progress}%`,
                height: '100%',
                background: 'var(--yuki-color-primary)',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--yuki-font-size-xs)', color: 'var(--yuki-color-text-tertiary)' }}>
              负责人：{project.owner}
            </span>
            <Button size="sm" variant="text">
              查看详情
            </Button>
          </div>
        </div>
      )}
    />
  );
}
