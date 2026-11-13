import { Divider, Text } from '@yuki-ui/react';

export default function BasicDivider() {
  return (
    <div>
      <Text>账户信息与安全设置属于不同的心理分组，用一条克制的水平线提示边界。</Text>
      <Divider />
      <Text tone="secondary">默认分隔，无标签。</Text>
      <Divider>或</Divider>
      <Text tone="secondary">居中标签，适合登录/注册之间的切换提示。</Text>
    </div>
  );
}
