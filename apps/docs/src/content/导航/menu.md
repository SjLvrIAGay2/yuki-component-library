---
title: Menu 导航菜单
group: 导航
description: 为页面和功能提供导航，支持横向、纵向与内联收起模式。
order: 2
---

# Menu 导航菜单

菜单用于在页面之间或页面内组织导航结构，支持横向、纵向和内联三种模式。数据由 `items` 驱动，选中与展开状态既可受控也可非受控。

## 何时使用

- 需要在站点顶部或侧边提供多级导航。
- 需要折叠侧边栏但保留图标导航。
- 需要受控地管理 `selectedKeys` / `openKeys`，例如与路由同步。

## 基础用法

传入 `items` 即可渲染菜单；子菜单通过 `children` 嵌套。默认选中项由 `defaultSelectedKeys` 指定，展开项由 `defaultOpenKeys` 指定。

<Demo id="menu/01-basic" />

## 深度定制

- `mode` 切换 `horizontal` / `vertical` / `inline`。
- `inlineCollapsed` 收起内联菜单。有图标的条目显示图标，纯文本条目保留紧凑标签。点击子菜单可在侧边打开完整选项。
- `selectedKeys`、`openKeys` 受控；`onSelect`、`onOpenChange` 回传最新状态。
- `multiple` 支持多选；菜单项支持 `icon`、`extra`、`danger`、`disabled`、`type: 'divider' | 'group'`。

<Demo id="menu/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 菜单数据 | `MenuItemConfig[]` | — |
| mode | 菜单模式 | `horizontal ｜ vertical ｜ inline` | `vertical` |
| selectedKeys | 选中的菜单项（受控） | `string[]` | — |
| defaultSelectedKeys | 默认选中项 | `string[]` | — |
| onSelect | 选中菜单项回调 | `(key: string, item: MenuItemConfig) => void` | — |
| openKeys | 展开的子菜单（受控） | `string[]` | — |
| defaultOpenKeys | 默认展开的子菜单 | `string[]` | — |
| onOpenChange | 展开项变化回调 | `(openKeys: string[]) => void` | — |
| multiple | 是否允许多选 | `boolean` | `false` |
| selectable | 是否允许选中 | `boolean` | `true` |
| inlineCollapsed | 收起内联菜单 | `boolean` | `false` |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames | `{ root, item, itemIcon, itemLabel, itemExtra, submenu, submenuTrigger, submenuArrow, submenuList, popup, group, groupTitle, divider }` | — | — |
| styles | 同上 | — | — |

### MenuItemConfig

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| key | 唯一标识 | `string` |
| label | 菜单文案 | `ReactNode` |
| icon / extra | 前置图标 / 尾部内容 | `ReactNode` |
| disabled / danger | 禁用 / 危险样式 | `boolean` |
| type | 普通项、分隔线或分组 | `item ｜ divider ｜ group` |
| href | 渲染为链接 | `string` |
| children | 子菜单或分组内容 | `MenuItemConfig[]` |
| onClick | 单项点击回调 | `(info) => void` |

## 定制点

- **Token**：`--yuki-menu-item-height`、`--yuki-menu-item-padding-inline`、`--yuki-menu-item-gap`、`--yuki-menu-selected-bg`、`--yuki-menu-selected-color`、`--yuki-menu-danger-color`、`--yuki-menu-indicator-color`、`--yuki-menu-submenu-min-width` 等。
- **类名/样式**：每个语义节点都有对应插槽，可替换任意部分外观。
- **结构**：数据驱动，支持分组、分隔线与递归子菜单。

## 无障碍

- 根节点使用 `role="menu"`（横向为 `menubar`），菜单项使用 `role="menuitem"`，子菜单触发器带 `aria-haspopup` 与 `aria-expanded`。
- 键盘：`↑` / `↓` 移动，`Home` / `End` 跳转首尾，`→` 展开子菜单，`←` / `Esc` 收起并回到触发器，`Enter` / `Space` 激活。
- 聚焦项使用 roving tabindex；禁用项不会进入 Tab 序列。
