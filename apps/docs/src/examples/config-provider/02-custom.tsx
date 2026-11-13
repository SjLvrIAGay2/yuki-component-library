import { ConfigProvider, Button, Divider, Flex, Typography } from '@yuki-ui/react';
import { useState } from 'react';

export default function ConfigProviderCustom() {
  const [dark, setDark] = useState(true);
  const [brand, setBrand] = useState('#2f9e8f');

  return (
    <Flex direction="column" gap="3" align="start">
      <Flex gap="2" wrap align="center">
        <Button variant="outline" size="sm" onClick={() => setDark((value) => !value)}>
          {dark ? '切换到浅色' : '切换到深色'}
        </Button>
        {['#2f9e8f', '#c2410c', '#6d28d9'].map((color) => (
          <Button
            key={color}
            size="sm"
            variant={brand === color ? 'solid' : 'ghost'}
            onClick={() => setBrand(color)}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: 'var(--yuki-icon-size-sm)',
                height: 'var(--yuki-icon-size-sm)',
                borderRadius: 'var(--yuki-radius-full)',
                background: color,
                marginInlineEnd: 'var(--yuki-space-1-5)',
              }}
            />
            品牌色
          </Button>
        ))}
      </Flex>

      <div
        style={{
          width: '100%',
          padding: 'var(--yuki-space-5)',
          borderRadius: 'var(--yuki-radius-xl)',
          background: 'var(--yuki-color-bg-subtle)',
        }}
      >
        <ConfigProvider
          theme={{
            mode: dark ? 'dark' : 'light',
            primaryColor: brand,
            tokens: { 'radius-md': '10px' },
          }}
          global={false}
        >
          <Flex direction="column" gap="3" align="start">
            <Typography.Title level={4} gutterBottom>
              品牌主题
            </Typography.Title>
            <Typography.Text tone="secondary">
              primaryColor 会派生 hover / active / subtle / border / ring；tokens 覆盖单个全局 token。
            </Typography.Text>
            <Divider />
            <Flex gap="2" wrap>
              <Button>主要操作</Button>
              <Button variant="outline">次要操作</Button>
              <Button variant="soft" tone="danger">
                危险操作
              </Button>
            </Flex>
          </Flex>
        </ConfigProvider>
      </div>
    </Flex>
  );
}
