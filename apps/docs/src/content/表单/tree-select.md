---
title: TreeSelect
group: 表单
description: 树形选择器。可展开/收起、单选与多选、搜索定位、自定义节点与完整键盘操作。
order: 14
---

## 何时使用

选项以树形结构组织且需要在一个下拉面板中选择节点时使用 TreeSelect。层级固定且只需选择叶子路径时可用 `Cascader`；多选扁平列表请用 `<Select multiple>`。

- 单选：`<TreeSelect options={...} />`
- 多选：`multiple`，选中项以标签展示
- 搜索：`searchable`，自动展开命中节点的祖先
- 默认全部展开：`defaultExpandAll`

## 基础用法

`value` 单选为 `T`，多选为 `readonly T[]`；点击父节点左侧箭头所在的整列区域可展开或收起分支。点击节点文字提交选中值，多选时切换该项并保持面板打开。

<Demo id="tree-select/01-basic" />

## 深度定制

- 展开控制：`expandedKeys` + `onExpandedChange`（受控），`defaultExpandedKeys`（非受控），`defaultExpandAll` 一键全展开。
- 搜索：`filterTreeNode(query, node)` 自定义匹配；命中节点保留整棵子树并展开其祖先。
- 节点渲染：`renderNode(node, { depth, expanded, selected, active, disabled, leaf })`。
- 标签：`maxTagCount` / `maxTagPlaceholder(hiddenNodes)` / `removeLabel(node)`。
- 状态与尺寸：`disabled`、`readOnly`、`invalid`、`status`、`size`、`borderless`。

<Demo id="tree-select/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label / description / error | 独立字段的标签、说明与错误提示 | ReactNode | — |
| portalContainer | 弹层挂载节点 | Element | document.body |
| inheritDisabled | 子节点继承上级禁用态 | boolean | false |
| animation | 展开、收起的动效设置 | AnimationOptions 或 false | — |
| triggerProps / valueProps / viewportProps / contentProps | 设置触发器、选中值、节点列表与面板的原生属性 | HTMLAttributes | — |
| optionProps | 为指定节点绑定样式、属性与事件 | (node, index) => HTMLAttributes | — |
| icon / indicator | 展开图标与选中标记 | ReactNode | — |
| forceMount | 关闭时保留隐藏的树和搜索框 | boolean | false |
| options | 树数据 | `TreeNodeOption<T>[]` | — |
| value | 受控值（单选 `T`，多选数组） | `T \| readonly T[] \| null` | — |
| defaultValue | 非受控初始值 | 同上 | — |
| onChange | 值变化 | `(value: T \| T[] \| null, nodes) => void` | — |
| onClear | 清除时触发 | `() => void` | — |
| multiple | 多选 | `boolean` | `false` |
| open / defaultOpen / onOpenChange | 面板展开控制 | `boolean` / `boolean` / `(open) => void` | `false` |
| size | 尺寸 | `sm \| md \| lg` | 继承 ConfigProvider |
| placeholder | 占位内容 | `string` | 继承 locale |
| disabled / readOnly / invalid / status | 状态 | 与 Select 一致 | — |
| clearable | 清除按钮 | `boolean` | `false` |
| searchable / filterTreeNode / onSearch | 搜索 | `boolean` / `(query, node) => boolean` / `(query) => void` | — |
| searchPlaceholder | 搜索占位 | `string` | 继承 locale |
| emptyText | 空态内容 | `ReactNode` | 继承 locale |
| defaultExpandAll | 默认全部展开 | `boolean` | `false` |
| defaultExpandedKeys | 默认展开的节点 | `T[]` | — |
| expandedKeys / onExpandedChange | 受控展开 | `T[]` / `(keys: T[]) => void` | — |
| maxTagCount / maxTagPlaceholder | 标签折叠 | `number` / `(hidden) => ReactNode` | — |
| removeLabel | 标签移除按钮名称 | `(node) => string` | `移除 <label>` |
| renderNode | 自定义节点 | `(node, state) => ReactNode` | — |
| showArrow / borderless / placement | 外观与浮层位置 | 同 DatePicker | — |
| name / required | 原生表单绑定 | `string` / `boolean` | — |
| classNames / styles | 语义节点类名与样式 | `TreeSelectClassNames` / `TreeSelectStyles` | — |

### TreeNodeOption

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| value | 节点值 | `T` |
| label | 节点内容 | `ReactNode` |
| children | 子节点 | `TreeNodeOption<T>[]` |
| disabled | 禁用 | `boolean` |
| isLeaf | 强制视为叶子（有 children 也不展开） | `boolean` |

## 定制点

- **Token**：`.yuki-tree-select` 提供 `--yuki-tree-select-panel-padding`、`-node-height`、`-node-gap`、`-tree-max-height`、`-tree-width`、`-checkbox-size`、`-toggle-size`。
- **类名**：`classNames.root | trigger | tags | tag | tagLabel | tagRemove | more | panel | search | searchInput | tree | node | nodeToggle | nodeCheckbox | nodeContent | nodeLabel | value | placeholder | prefix | suffix | clear | arrow`。
- **状态**：节点暴露 `data-depth`、`data-value`、`data-expanded`、`data-active`、`data-selected`、`data-disabled`；缩进由 `padding-inline-start` 计算 token 得到。
- **结构**：面板内 `.yuki-tree-select__tree` 为 `role="tree"`，节点为 `role="treeitem"`，多选时节点带 `aria-checked`。

## 无障碍

- 触发器 `role="combobox"`，带 `aria-haspopup="tree"`、`aria-expanded`、`aria-controls`、`aria-activedescendant`。
- 树为 `role="tree"`，节点 `aria-level`、父节点 `aria-expanded`、单选 `aria-selected`、多选 `aria-checked`、禁用 `aria-disabled`。
- 键盘：`ArrowDown/Up` 移动，`Home/End` 首尾，`ArrowRight` 展开或进入子节点，`ArrowLeft` 收起或回到父节点，`Enter/Space` 选择，字母键 typeahead，`Escape` 关闭并还原焦点。
- 多选面板带 `aria-multiselectable="true"`；关闭态按 `Backspace` 可移除最后一个标签。
- `renderNode` 自定义时请保留节点可聚焦能力与可访问名称。
