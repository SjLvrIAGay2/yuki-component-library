---
title: Dropdown 下拉菜单
group: 导航
description: 向下展开的操作菜单，支持点击或悬停触发。
order: 4
---

# Dropdown 下拉菜单

下拉菜单把一组操作收纳在触发器之后，点击或悬停展开，常用于「更多操作」、行内菜单和视图切换。

## 何时使用

- 操作较多、空间有限，需要收纳为菜单。
- 需要按分组组织命令，或标记危险操作。
- 表单内的选择请使用 Select，而非 Dropdown。

## 基础用法

传入 `items` 与触发元素，默认点击展开。选择后会关闭并回传 `onSelect`。

<Demo id="dropdown/01-basic" />

## 深度定制

- `triggerMode="hover"` 悬停展开，`open` / `onOpenChange` 可实现受控展开。
- `placement` 控制弹出位置，`arrow` 显示箭头。
- `closeOnSelect={false}` 支持连续操作；菜单项支持 `danger`、`disabled`、`extra` 和分组。

<Demo id="dropdown/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| trigger | 触发元素（单个 React 元素） | `ReactElement` | — |
| items | 菜单数据 | `readonly DropdownItemConfig[]` | — |
| triggerMode | 触发方式 | `click ｜ hover` | `click` |
| open | 展开状态（受控） | `boolean` | — |
| defaultOpen | 默认展开 | `boolean` | `false` |
| onOpenChange | 展开状态变化 | `(open: boolean) => void` | — |
| onSelect | 选择菜单项 | `(key, item, event) => void` | — |
| placement | 弹出位置 | `Placement` | `bottom-start` |
| closeOnSelect | 选择后关闭 | `boolean` | `true` |
| disabled | 禁用触发器 | `boolean` | `false` |
| arrow | 显示箭头 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames | `{ trigger, popup, list, item, itemIcon, itemLabel, itemExtra, divider, group, groupTitle }` | — | — |
| styles | 同上 | — | — |

### DropdownItemConfig

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一标识 | `string` |
| label | 菜单文案 | `ReactNode` |
| icon / extra | 前置图标 / 尾部内容 | `ReactNode` |
| danger / disabled | 危险 / 禁用 | `boolean` |
| type | `item ｜ divider ｜ group` | `DropdownItemType` |
| href | 渲染为链接 | `string` |
| children | 分组内容 | `DropdownItemConfig[]` |

### 组合式菜单

把按钮传给 `trigger`，即可用子节点声明分组标题、分隔线和菜单项。打开后可输入文字定位条目。

```tsx
<Dropdown trigger={<Button>文件操作</Button>}>
  <DropdownLabel>文件</DropdownLabel>
  <DropdownSeparator />
  <DropdownItem onSelect={renameFile}>重命名</DropdownItem>
</Dropdown>
```

<Demo id="dropdown/03-composition" />

<Demo id="dropdown/04-links" />

| 组件 | 属性 | 用途 |
| --- | --- | --- |
| Dropdown | align、contentProps、portalProps、portalContainer、animation | 定制组合菜单的对齐、定位、挂载和动效 |
| DropdownItem | onSelect、disabled、destructive | 执行操作、禁用或使用危险色。调用 event.preventDefault() 保持菜单打开 |
| DropdownItem | icon、shortcut、asChild、textProps、shortcutProps | 显示图标和快捷键，用链接作为条目，定制文字与快捷键容器 |
| DropdownLabel、DropdownSeparator | children、原生属性 | 分组标题、分隔线 |

## 定制点

- **Token**：通过 `--yuki-popup-*` 系列控制浮层外观，菜单项复用文本、边框、圆角与间距 token。
- **类名/样式**：触发器、浮层、列表、菜单项、图标、尾部与分组均有插槽。
- **结构**：菜单项可以是按钮或链接，危险项自动使用 danger 语义色。

## 无障碍

- 触发器带 `aria-haspopup="menu"`、`aria-expanded` 与 `aria-controls`；列表为 `role="menu"`，项为 `role="menuitem"`。
- 键盘：`↓` / `↑` 打开并在项间移动，`Home` / `End` 跳转，`Enter` / `Space` 选择，`Esc` 关闭并把焦点还给触发器。
- 点击浮层外部或按 `Esc` 关闭；禁用项不可聚焦、不触发选择，分隔线使用 `role="separator"`。
