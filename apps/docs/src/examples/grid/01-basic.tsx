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
        background: 'var(--yuki-color-bg-subtle)',
        border: '1px solid var(--yuki-color-border-subtle)',
        color: 'var(--yuki-color-text-secondary)',
        fontSize: 'var(--yuki-font-size-sm)',
      }}
    >
      {children}
    </div>
  );
}

export default function BasicGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--yuki-space-4)' }}>
      <Grid gap="3">
        <GridItem span={12}>
          <Cell>12 / 12</Cell>
        </GridItem>
      </Grid>

      <Grid gap="3">
        <GridItem span={6}>
          <Cell>6</Cell>
        </GridItem>
        <GridItem span={6}>
          <Cell>6</Cell>
        </GridItem>
      </Grid>

      <Grid gap="3">
        <GridItem span={4}>
          <Cell>4</Cell>
        </GridItem>
        <GridItem span={4}>
          <Cell>4</Cell>
        </GridItem>
        <GridItem span={4}>
          <Cell>4</Cell>
        </GridItem>
      </Grid>

      <Grid gap="3">
        <GridItem span={3}>
          <Cell>3</Cell>
        </GridItem>
        <GridItem span={6}>
          <Cell>6（居中列）</Cell>
        </GridItem>
        <GridItem span={3}>
          <Cell>3</Cell>
        </GridItem>
      </Grid>

      <Text size="sm" tone="tertiary">
        间距全部来自 <code>--yuki-space-*</code>，栅格本身不产生任何硬编码尺寸。
      </Text>
    </div>
  );
}
