import { Grid, GridItem, Text } from '@yuki-ui/react';

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '3.5rem',
        padding: 'var(--yuki-space-2)',
        borderRadius: 'var(--yuki-radius-sm)',
        background: 'var(--yuki-color-primary-subtle)',
        border: '1px solid var(--yuki-color-primary-border)',
        color: 'var(--yuki-color-text)',
        fontSize: 'var(--yuki-font-size-sm)',
      }}
    >
      {children}
    </div>
  );
}

export default function ResponsiveGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Grid gap="3" rowGap="4">
        <GridItem span={12} responsive={{ sm: 6, lg: 4 }}>
          <Cell>sm:6 · lg:4</Cell>
        </GridItem>
        <GridItem span={12} responsive={{ sm: 6, lg: 4 }}>
          <Cell>sm:6 · lg:4</Cell>
        </GridItem>
        <GridItem span={12} responsive={{ sm: 6, lg: 4 }}>
          <Cell>sm:6 · lg:4</Cell>
        </GridItem>
      </Grid>

      <Grid gap="3" align="center">
        <GridItem span={3} start={2}>
          <Cell>start 2 · span 3</Cell>
        </GridItem>
        <GridItem span={5}>
          <Cell>span 5</Cell>
        </GridItem>
      </Grid>

      <Text size="sm" tone="tertiary">
        拖动浏览器宽度可以看到响应式跨度变化；移动端默认整行（span 12）。
      </Text>
    </div>
  );
}
