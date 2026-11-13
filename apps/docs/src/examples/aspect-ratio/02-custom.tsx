import { AspectRatio, Grid, GridItem, Text } from '@yuki-ui/react';

export default function CustomAspectRatio() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Grid gap="3">
        {[
          { ratio: 1, label: '1:1 头像' },
          { ratio: 4 / 3, label: '4:3 缩略图' },
          { ratio: '21 / 9', label: '21:9 横幅' },
        ].map((item) => (
          <GridItem key={item.label} span={4}>
            <AspectRatio
              ratio={item.ratio}
              style={{
                borderRadius: 'var(--yuki-radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--yuki-color-border-subtle)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  background: 'var(--yuki-color-bg-subtle)',
                  color: 'var(--yuki-color-text-tertiary)',
                  fontSize: 'var(--yuki-font-size-xs)',
                }}
              >
                {item.label}
              </div>
            </AspectRatio>
          </GridItem>
        ))}
      </Grid>

      <AspectRatio ratio={16 / 9} className="docs-media">
        <img
          alt="示例：渐变封面"
          src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23c7d2fe'/%3E%3Cstop offset='1' stop-color='%23f1f5f9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23g)'/%3E%3C/svg%3E"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AspectRatio>

      <Text size="xs" tone="tertiary">
        图片、视频与 iframe 会被自动铺满并裁切；ratio 也接受 CSS 比例字符串。
      </Text>
    </div>
  );
}
