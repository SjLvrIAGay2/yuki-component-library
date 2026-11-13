import { Icon, iconNames } from '@yuki-ui/react';

const FEATURED = [
  'sparkles',
  'search',
  'settings',
  'bell',
  'calendar',
  'folder',
  'trash',
  'download',
  'heart',
  'star',
  'user',
  'mail',
  'lock',
  'sun',
  'moon',
  'monitor',
] as const;

export default function BasicIcon() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-4)' }}>
        {FEATURED.map((name) => (
          <span
            key={name}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--yuki-space-1-5)',
              width: '4rem',
              color: 'var(--yuki-color-text-secondary)',
              fontSize: 'var(--yuki-font-size-2xs)',
            }}
          >
            <Icon name={name} size="1.25rem" />
            {name}
          </span>
        ))}
      </div>
      <p style={{ margin: 0, color: 'var(--yuki-color-text-tertiary)', fontSize: 'var(--yuki-font-size-xs)' }}>
        内置 {iconNames.length} 个图标，均可通过 <code>IconName</code> 获得类型提示。
      </p>
    </div>
  );
}
