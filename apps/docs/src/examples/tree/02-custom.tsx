import { useState } from 'react';
import { Icon, Tree } from '@yuki-ui/react';

interface Permission {
  key: string;
  title: string;
  badge?: string;
  children?: Permission[];
}

const treeData: Permission[] = [
  {
    key: 'dashboard',
    title: '工作台',
    children: [
      { key: 'dashboard-view', title: '查看概览', badge: '只读' },
      { key: 'dashboard-export', title: '导出报表', badge: '敏感' },
    ],
  },
  {
    key: 'user',
    title: '用户管理',
    children: [
      { key: 'user-list', title: '用户列表' },
      { key: 'user-edit', title: '编辑用户', badge: '敏感' },
      { key: 'user-delete', title: '删除用户', badge: '高危' },
    ],
  },
  {
    key: 'system',
    title: '系统设置',
    children: [
      { key: 'system-role', title: '角色权限' },
      { key: 'system-audit', title: '审计日志' },
    ],
  },
];

export default function CustomTree() {
  const [checkedKeys, setCheckedKeys] = useState<string[]>(['dashboard-view', 'system-role']);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['dashboard', 'user']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-3)' }}>
      <Tree
        treeData={treeData}
        checkable
        multiple
        expandedKeys={expandedKeys}
        checkedKeys={checkedKeys}
        onExpand={(keys) => setExpandedKeys(keys as string[])}
        onCheck={(keys) => setCheckedKeys(keys as string[])}
        renderTitle={(node, info) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--yuki-space-2)',
              fontWeight: info.checked ? 'var(--yuki-font-weight-semibold)' : undefined,
            }}
          >
            {node.title}
            {node.badge && (
              <span
                style={{
                  padding: '0 var(--yuki-space-1)',
                  borderRadius: 'var(--yuki-radius-xs)',
                  fontSize: 'var(--yuki-font-size-2xs)',
                  color: 'var(--yuki-color-warning)',
                  background: 'var(--yuki-color-warning-subtle)',
                }}
              >
                {node.badge}
              </span>
            )}
          </span>
        )}
        switcherIcon={<Icon name="chevron-right" size="0.75rem" />}
      />
      <span style={{ fontSize: 'var(--yuki-font-size-sm)', color: 'var(--yuki-color-text-secondary)' }}>
        已授权 {checkedKeys.length} 项：{checkedKeys.join('、') || '无'}
      </span>
    </div>
  );
}
