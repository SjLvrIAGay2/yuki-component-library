import { useState } from 'react';
import { Button, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator, Icon } from '@yuki-ui/react';

export default function SortMenu() {
  const [sort, setSort] = useState('更新时间');
  return (
    <Dropdown trigger={<Button variant="outline">排序 · {sort}</Button>}>
      <DropdownLabel>项目排序</DropdownLabel>
      <DropdownSeparator />
      {['更新时间', '名称', '创建时间'].map((name) => (
        <DropdownItem key={name} onSelect={() => setSort(name)} icon={<Icon name={sort === name ? 'check' : undefined} />}>
          {name}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
