---
title: Cascader
group: 表单
description: 级联选择器。多级联动、任意层级提交、搜索、自定义渲染与完整键盘操作。
order: 13
---

## 何时使用

选项之间存在层级关系（省/市/区、类目/子类目等）且需要选择层级路径时使用 Cascader。选项层级较浅且可平铺时可用 `Select`，需要树形展开的自由选择可用 `TreeSelect`。

- 基础联动：`<Cascader options={...} />`
- 任意层级可提交：`changeOnSelect`
- 可搜索：`searchable`，按路径中任一层级匹配
- 放入 `Form.Item name` 后，表单管理路径值和校验状态。单独使用可传 `value` 和 `onChange`。
- 路径展示：默认 `' / '` 拼接，可用 `displayRender` 自定义

## 基础用法

`value` 为从根到叶的 `readonly T[]` 路径；点击叶子提交并关闭，点击非叶子展开下一列。

<Demo id="cascader/01-basic" />

## 深度定制

- `changeOnSelect`：点击任意层级即提交（例如只选到“浙江”）。
- `renderOption(option, { depth, active, selected, disabled, expandable })`：自定义选项内容，例如显示层级或图标。
- `displayRender(labels, selectedOptions)`：自定义触发器上的路径展示。
- `filterOption(query, leaf)`：自定义搜索匹配（默认匹配路径中任一节点 label）。
- `emptyText`、`searchPlaceholder`、`size`、`status` 等外观属性。

<Demo id="cascader/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 级联数据 | `CascaderOption<T>[]` | — |
| value | 受控路径 | `CascaderValue<T> \| null` | — |
| defaultValue | 非受控初始值 | `CascaderValue<T> \| null` | `null` |
| onChange | 选中叶子或层级 | `(value: CascaderValue<T> \| null, selectedOptions: CascaderOption<T>[]) => void` | — |
| onClear | 清除时触发 | `() => void` | — |
| open / defaultOpen / onOpenChange | 面板展开控制 | `boolean` / `boolean` / `(open) => void` | `false` |
| size | 尺寸 | `sm \| md \| lg` | 继承 ConfigProvider |
| placeholder | 占位内容 | `ReactNode` | 继承 locale |
| disabled / readOnly / invalid / status | 状态 | 与 Select 一致 | — |
| clearable | 清除按钮 | `boolean` | `false` |
| changeOnSelect | 任意层级可提交 | `boolean` | `false` |
| searchable / filterOption / onSearch | 搜索 | `boolean` / `(query, leaf) => boolean` / `(query) => void` | — |
| searchPlaceholder | 搜索占位 | `string` | 继承 locale |
| emptyText | 空态内容 | `ReactNode` | 继承 locale |
| displayRender | 路径展示 | `(labels: ReactNode[], selected) => ReactNode` | `' / '` 拼接 |
| renderOption | 自定义选项 | `(option, state) => ReactNode` | — |
| showArrow / borderless / placement | 外观与浮层位置 | 同 DatePicker | — |
| name / required | 原生表单绑定（值为逗号连接） | `string` / `boolean` | — |
| classNames / styles | 语义节点类名与样式 | `CascaderClassNames` / `CascaderStyles` | — |

### CascaderOption

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| value | 层级值 | `T` |
| label | 展示内容 | `ReactNode` |
| children | 子级选项 | `CascaderOption<T>[]` |
| disabled | 禁用 | `boolean` |
| isLeaf | 强制视为叶子 | `boolean` |

## 定制点

- **Token**：`.yuki-cascader` 提供 `--yuki-cascader-column-width`、`-column-height`、`-option-height`、`-separator-color`。
- **类名**：`classNames.root | trigger | panel | columns | column | option | optionLabel | optionExpand | optionCheck | search | searchInput | results | separator | status | value | placeholder | prefix | suffix | clear | arrow`。
- **状态**：根节点 `data-size`、`data-open`、`data-disabled` 等；选项 `data-slot="option"` 与 `--active/--selected/--disabled` 修饰类。
- **结构**：每一级是一列 `role="listbox"`，列内选项 `role="option"`；搜索结果列表同样为 listbox。

## 无障碍

- 触发器 `role="combobox"`，面板 `role="dialog"`（`aria-label` 为“选择选项”）。
- 每列 `role="listbox"` 带 `aria-label="第 N 级选项"`，选项 `aria-selected`、`aria-disabled`。
- 键盘（列聚焦时）：`ArrowUp/Down` 移动并跳过禁用项，`Home/End` 首尾，`ArrowRight` 展开/进入下一列，`ArrowLeft` 返回上一级，`Enter/Space` 选中或展开。
- 搜索模式下输入框获得焦点。空搜索时按向下键或回车进入第一列。输入查询后，禁用节点及其子路径仍会显示为禁用。`ArrowUp/Down` 在结果间移动，`Enter` 提交；`Escape` 关闭并把焦点还给触发器。
