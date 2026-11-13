---
title: Tree
group: 数据展示
description: 树形控件，支持展开/选中/勾选、半选、键盘导航、字段映射与虚拟滚动。
order: 3
---

## 何时使用

展示层级数据并允许展开、浏览、选择或授权时使用，例如组织架构、目录、权限树。只需要平铺的多级选项时优先考虑 Menu 或 Cascader。

## 基础用法

`treeData` 提供嵌套数据，`title` 是节点文本、`children` 是子节点、`key` 是唯一标识。默认展开、默认选中均可通过 `defaultExpandAll` / `defaultSelectedKeys` 初始化。

<Demo id="tree/01-basic" />

## 深度定制

开启 `checkable` 后父子勾选级联，父节点在部分子节点选中时显示半选；`checkStrictly` 可让父子独立。`renderTitle` 自定义节点内容，`fieldNames` 映射任意数据结构，`virtual` 处理大规模节点。

<Demo id="tree/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| treeData | 树数据 | `readonly T[]` | — |
| fieldNames | 字段映射 | `{ key?, title?, children?, disabled?, disableCheckbox?, isLeaf? }` | 同名字段 |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| disabled | 整体禁用 | `boolean` | `false` |
| checkable | 显示复选框 | `boolean` | `false` |
| checkStrictly | 父子勾选独立（不做级联，不显示半选） | `boolean` | `false` |
| selectable | 允许选中 | `boolean` | `true` |
| multiple | 多选模式 | `boolean` | `false` |
| expandedKeys / defaultExpandedKeys | 受控 / 默认展开键 | `readonly TreeKey[]` | — |
| defaultExpandAll | 默认展开全部 | `boolean` | `false` |
| onExpand | 展开变化 | `(keys: TreeKey[], info: { node, expanded }) => void` | — |
| checkedKeys / defaultCheckedKeys | 受控 / 默认勾选键 | `readonly TreeKey[]` | — |
| onCheck | 勾选变化 | `(keys: TreeKey[], info: { node, checked, checkedNodes }) => void` | — |
| selectedKeys / defaultSelectedKeys | 受控 / 默认选中键 | `readonly TreeKey[]` | — |
| onSelect | 选中变化 | `(keys: TreeKey[], info: { node, selected, selectedNodes }) => void` | — |
| renderTitle | 自定义节点内容 | `(node: T, info: TreeTitleInfo) => ReactNode` | — |
| switcherIcon | 替换展开图标 | `ReactNode` | 旋转的 chevron |
| virtual | 虚拟滚动 | `{ height: number; itemSize?: number; overscan?: number }` | — |
| loading | 加载中 | `boolean` | `false` |
| emptyRender | 自定义空状态 | `() => ReactNode` | `t('tree.empty')` |
| classNames / styles | 语义节点插槽 | `TreeClassNames` / `TreeStyles` | — |

`TreeTitleInfo` 为 `{ key, depth, expanded, selected, checked, indeterminate }`，可用于在自定义标题中反映交互状态。

### TreeNodeData

内置默认节点结构为 `{ key, title?, children?, disabled?, disableCheckbox?, isLeaf? }`；`isLeaf: true` 时即使存在 `children` 也不显示展开按钮。

## 定制点

- **Token**：在 `.yuki-tree` 上覆盖 `--yuki-tree-indent`（层级缩进）、条目高度、悬停/选中背景等变量；展开图标、复选框与文本颜色消费语义 token。
- **类名/样式**：`classNames` / `styles` 提供 `root`、`viewport`、`list`、`virtualContent`、`item`、`switcher`、`switcherIcon`、`checkbox`、`title`、`titleText`、`empty`、`loading`、`spinner` 插槽；每个节点另有 `data-key` / `data-depth` / `data-expanded` / `data-selected` / `data-checked` / `data-indeterminate` / `data-disabled` 状态属性。
- **数据结构**：默认字段不符合时用 `fieldNames` 映射；需要图标、徽标、统计数等富内容时使用 `renderTitle`。
- **行为**：受控 `expandedKeys` / `checkedKeys` / `selectedKeys` 与对应的 `on*` 回调可组合成服务端驱动的树；`virtual` 需要固定 `height` 与稳定的 `itemSize`。

## 无障碍

- 根节点 `role="tree"`，每个节点 `role="treeitem"`，并带 `aria-level`、`aria-setsize`、`aria-posinset`、`aria-expanded`、`aria-selected`、`aria-checked`（含 `mixed`）与 `aria-disabled`。
- 键盘：`↑` / `↓` 移动焦点，`→` 展开或进入第一个子节点，`←` 收起或回到父节点，`Home` / `End` 跳到首尾，`Enter` 选中，`Space` 在 `checkable` 时切换勾选。
- 采用 roving tabindex，整棵树只保留一个可聚焦节点；展开按钮与复选框不进入 Tab 序列，避免焦点爆炸。
- 虚拟滚动下只有可视节点存在于 DOM，读屏可访问的节点数量受限，超大数据集建议同时提供搜索或分页入口。

## 目录单选

传入 options 可直接使用 TreeOption 的 value、label、children、disabled 字段。点击分支展开或收起，点击叶子选中该值。分支上的 disabled 会禁止选择其全部后代，仍可展开查看。使用 value 或 defaultValue 保存单个字符串，onValueChange 返回选中的叶子值。

<Demo id="tree/03-options" />
