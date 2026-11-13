import { ConfigProvider, Button, Flex, Typography, type Size } from '@yuki-ui/react';
import { useState } from 'react';

export default function ConfigProviderBasic() {
  const [locale, setLocale] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [size, setSize] = useState<Size>('md');

  return (
    <Flex direction="column" gap="4">
      <Flex gap="2" wrap align="center">
        <Button size="sm" variant="outline" onClick={() => setLocale('zh-CN')}>
          中文
        </Button>
        <Button size="sm" variant="outline" onClick={() => setLocale('en-US')}>
          English
        </Button>
        <span style={{ width: 'var(--yuki-space-2)' }} />
        {(['sm', 'md', 'lg'] as const).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={size === item ? 'solid' : 'ghost'}
            onClick={() => setSize(item)}
          >
            {item}
          </Button>
        ))}
      </Flex>

      <div
        style={{
          padding: 'var(--yuki-space-4)',
          border: 'var(--yuki-border-width-thin) solid var(--yuki-color-border)',
          borderRadius: 'var(--yuki-radius-lg)',
        }}
      >
        <ConfigProvider locale={locale} size={size}>
          <Flex direction="column" gap="3" align="start">
            <Typography.Text tone="secondary">
              {locale === 'zh-CN'
                ? '嵌套的 ConfigProvider：尺寸与语言只作用于这棵子树。'
                : 'A nested ConfigProvider: size and locale only affect this subtree.'}
            </Typography.Text>
            <Flex gap="2" wrap>
              <Button>确认</Button>
              <Button variant="soft">取消</Button>
              <Button variant="outline">更多</Button>
            </Flex>
          </Flex>
        </ConfigProvider>
      </div>
    </Flex>
  );
}
