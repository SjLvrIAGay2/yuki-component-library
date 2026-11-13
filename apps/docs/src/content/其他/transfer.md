---
title: Transfer
group: 其他
description: 双栏穿梭框。在两列之间移动条目，支持搜索、全选、自定义渲染与禁用项。
order: 3
---

## 何时使用

需要在两个集合之间搬运条目时使用 Transfer：角色授权、服务接入、字段选择、成员分组等。左栏是可选数据，右栏是已选数据，中间的按钮负责左右移动。

- 批量选择：内置全选（可关闭）与逐项勾选
- 数据量大：`searchable` 配合 `filterOption`
- 条目信息更丰富：`renderItem` 自定义行内容
- 只允许单向移入：`oneWay`

## 基础用法

`dataSource` 是全部条目，`targetKeys` 是右栏的 key 集合。受控时在 `onChange(targetKeys, direction, movedKeys)` 中回写；`direction` 为 `'right'`（移入）或 `'left'`（移出），`movedKeys` 是本次移动的 key。`titles` 自定义两栏标题，`searchable` 在每栏顶部提供带清除的搜索框。

<Demo id="transfer/01-basic" />

## 深度定制

`renderItem` 返回行内任意节点，`item.description` 会作为第二行说明渲染；`disabledKeys` 让指定条目不可移动，条目自身的 `disabled` 同样生效。`oneWay` 隐藏「移回左侧」按钮，适合只增不减的授权场景；`selectAll`、`filterOption`、`emptyText`、`size` 分别控制全选、过滤、空态与尺寸。

<Demo id="transfer/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSource | 全部条目 | `T[]` | — |
| targetKeys | 受控的右栏 key 集合 | `string[]` | — |
| defaultTargetKeys | 非受控初始值 | `string[]` | `[]` |
| onChange | 移动后触发 | `(targetKeys: string[], direction: TransferDirection, movedKeys: string[]) => void` | — |
| titles | 两栏标题 | `[ReactNode, ReactNode]` | 待选列表 / 已选列表 |
| searchable | 显示搜索框 | `boolean` | `false` |
| filterOption | 自定义过滤 | `(input: string, item: T) => boolean` | 匹配 title 与 key |
| selectAll | 显示全选 | `boolean` | `true` |
| renderItem | 自定义行渲染 | `(item: T) => ReactNode` | `item.title ?? item.key` |
| disabled | 整体禁用 | `boolean` | `false` |
| disabledKeys | 禁用条目 key | `string[]` | — |
| oneWay | 仅允许移入右侧 | `boolean` | `false` |
| emptyText | 空态文案 | `ReactNode` | 暂无数据 |
| size | 尺寸 | `sm ｜ md ｜ lg` | 继承 ConfigProvider |
| classNames / styles | 语义节点类名 / 样式 | `TransferClassNames` / `TransferStyles` | — |
| ref | 转发到根 `<div>` | `Ref<HTMLDivElement>` | — |

`TransferItem` 字段：`key`、`title`、`description`、`disabled`；`TransferDirection` 为 `'left' ｜ 'right'`。未列出的原生属性会透传到根 `<div>`。

## 定制点

- **Token**：`.yuki-transfer` 声明 `--yuki-transfer-gap`、`-column-gap`、`-column-bg`、`-column-border`、`-column-radius`、`-header-padding-block`、`-header-padding-inline`、`-header-bg`、`-title-size`、`-count-size`、`-count-bg`、`-count-radius`、`-search-padding-block`、`-search-padding-inline`、`-list-padding`、`-body-max-height`、`-item-gap`、`-item-padding-block`、`-item-padding-inline`、`-item-radius`、`-item-bg-hover`、`-item-bg-selected`、`-item-bg-selected-hover`、`-item-label-size`、`-item-description-size`、`-item-description-color`、`-empty-padding-block`、`-empty-padding-inline`、`-empty-color`、`-empty-size`。
- **类名/样式**：`classNames.root | column | header | title | count | selectAll | search | body | list | item | itemCheckbox | itemLabel | itemDescription | empty | operations | operation` 与 `styles.*`。
- **结构**：左右两栏 + 中间操作区；每栏由头部、可选的搜索框、可滚动列表组成；行的勾选框与行点击共享选中状态。
- **状态**：根节点 `data-size`、`data-disabled`；栏 `data-side="left ｜ right"`；条目 `data-selected`、`data-disabled` 是公开接口。

## 无障碍

- 每栏列表为 `role="listbox"` + `aria-multiselectable="true"`，并以栏目标题（或本地化的「待选列表 / 已选列表」）作为可读标签。
- 条目为 `role="option"`，`aria-selected` 表示是否勾选、`aria-disabled` 对应禁用；行内勾选框视觉上参与布局，但不会重复进入可访问名称。
- 采用漫游 `tabIndex`：`ArrowUp` / `ArrowDown` / `Home` / `End` 在条目间移动焦点，`Space` / `Enter` 切换勾选，连续输入字母可按标题首字母快速定位。
- 全选复选框带「全选 待选列表 / 已选列表」标签并支持半选状态；左右移动按钮是带方向 `aria-label` 的原生按钮；搜索框带可读标签。
- 焦点环使用 `--yuki-shadow-focus`；禁用项降低不透明度但保留可读文本，不单靠颜色区分。
