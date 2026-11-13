import { Button, ConfigProvider, Icon } from '@yuki-ui/react';

export default function CustomButton() {
  return (
    <ConfigProvider global={false} theme={{ primaryColor: 'var(--yuki-emerald-500)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--yuki-space-2)' }}>
          <Button startIcon={<Icon name="check" />}>品牌色主按钮</Button>
          <Button variant="soft">柔和变体</Button>
          <Button variant="outline">描边变体</Button>
          <Button variant="ghost">幽灵变体</Button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--yuki-space-2)' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button shape="round" startIcon={<Icon name="send" />}>
            胶囊形
          </Button>
          <Button shape="circle" iconOnly aria-label="发送" startIcon={<Icon name="send" />} />
          <Button tone="success" variant="soft" startIcon={<Icon name="check" />}>
            成功
          </Button>
          <Button tone="warning" variant="soft">
            警告
          </Button>
        </div>

        <Button block variant="soft" endIcon={<Icon name="download" />}>
          占满整行的块级按钮
        </Button>
      </div>
    </ConfigProvider>
  );
}
