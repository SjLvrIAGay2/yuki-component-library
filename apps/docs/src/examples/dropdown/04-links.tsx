import { Button, Dropdown, DropdownItem } from '@yuki-ui/react';

export default function HelpLinks() {
  return (
    <Dropdown align="start" trigger={<Button variant="outline">打开参考</Button>}>
      <DropdownItem asChild><a href="#/tokens">设计令牌</a></DropdownItem>
      <DropdownItem asChild><a href="#/c/config-provider">全局配置</a></DropdownItem>
    </Dropdown>
  );
}
