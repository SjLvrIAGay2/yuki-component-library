---
title: Select
group: 表单
description: 支持单选、多选标签、分组、搜索和键盘操作的下拉选择器。
order: 11
---

## 何时使用

从扁平或分组数据中选取一个值，使用 `<Select options={options} />`。需要选取多个值时加上 `multiple`。少量选项需要始终可见时可使用 RadioGroup 或 CheckboxGroup。层级路径使用 Cascader，按树节点选取使用 TreeSelect。

## 基础用法

单选接受 `value` 或 `defaultValue`，选中后收起面板，清空时返回 `null`。

<Demo id="select/01-basic" />

多选接受值数组，选中后保留面板。选择顺序决定标签、回调中的选项以及原生表单提交值的顺序。

<Demo id="select/03-multiple" />

## 自定义选项和标签

`renderOption` 收到选项及其 `selected`、`active`、`disabled` 状态。单选用 `renderValue` 定制当前值。带图标等复杂标签的选项可用 `textValue` 提供搜索和键盘匹配所需的文本。

<Demo id="select/02-custom" />

`renderTag` 为每个可见标签提供选项及可选移除函数。`maxTagCount` 同时作用于默认与自定义标签。`maxTagPlaceholder` 收到折叠的选项。

<Demo id="select/04-custom-tags" />

## API

### 值和事件

| 字段 | 单选（默认） | 多选（`multiple`） |
| --- | --- | --- |
| options | `readonly SelectOptionInput<T>[]` | 同单选 |
| value | `T｜null`，`undefined` 启用非受控模式 | `readonly T[]｜null`，`null` 表示空数组 |
| defaultValue | 初始值，默认为 `null` | 初始数组，默认为 `[]` |
| onChange | `(value: T｜null, option: SelectOption<T>｜null) => void` | `(values: T[], options: SelectOption<T>[]) => void` |
| onClear | 清空时调用 | 同单选 |
| renderValue / renderTag | `renderValue(option)` | `renderTag(option, remove)`；只读、禁用或 `removable={false}` 时 `remove` 为 `undefined` |
| onRemove | — | 取消选中某项或移除标签时调用，参数为该值 |
| removable / removeLabel | — | 允许移除标签（默认 `true`），`removeLabel(option)` 设置按钮名称 |
| maxTagCount / maxTagPlaceholder | — | 可见标签数量及折叠内容，默认展示全部。默认折叠内容为 `+N` |

每个选项提供唯一的 `value` 和可见的 `label: ReactNode`，可选 `description: ReactNode`、`textValue: string`、`disabled: boolean`。分组结构为 `{ label, options: SelectOption<T>[] }`。在多选模式中，当前值暂未出现在选项中时以该值的字符串形式显示，后续加载同值选项后自动使用新标签。

### 通用字段

| 字段 | 用法 |
| --- | --- |
| open / defaultOpen / onOpenChange | 控制面板是否展开或读取状态变化，初始关闭 |
| searchable / filterOption / onSearch | 打开面板内搜索。默认对选项文本做忽略大小写的子串匹配，可用 `filterOption(query, option)` 替换。输入变化调用 `onSearch(query)` |
| placeholder / searchPlaceholder | 选择器及搜索框占位提示，默认从当前语言取得 |
| loading / loadingText / emptyText | 加载期间展示加载提示，筛选无结果时展示空态提示 |
| size / status / invalid | `sm｜md｜lg`，默认继承 ConfigProvider。`status` 支持 `error｜warning｜success`，`invalid` 标识校验失败 |
| disabled / readOnly / clearable | 禁用、可聚焦的只读、允许清空，均默认关闭 |
| prefix / suffix / showArrow / borderless | 触发器前后缀，可隐藏默认箭头或去掉边框 |
| icon / indicator | 替换箭头或已选选项指示节点 |
| renderOption | `(option, { selected, active, disabled }) => ReactNode` |
| placement / popupWidth | 默认与触发器同宽。`popupWidth="content"` 随内容加宽至视口边界，默认位置从 `bottom` 调整为 `bottom-start` |
| portalContainer / forceMount / animation | 设置挂载容器、关闭时保留隐藏面板，以及进出动画 |
| triggerProps / contentProps / viewportProps / valueProps | 分别传给触发器、面板、列表和值节点的原生属性 |
| optionProps | `(option, index) => HTMLAttributes<HTMLLIElement>` |
| name / required | 参与原生表单提交。单选生成一个隐藏输入，多选每个值对应一个同名隐藏输入，可用 `FormData.getAll(name)` 读取。必填校验可用 Form.Item 的 `rules` |
| label / description / error | 独立字段标签、说明及错误。错误消息优先于说明 |
| fieldProps / labelProps / messageProps / controlClassName / controlStyle | 定制字段外层、标签、消息与控件样式 |
| classNames / styles / ref | 语义样式插槽，`ref` 指向根 div |

将控件放进 `<Form.Item name="tags">` 后，由 Form 的 `initialValues` 和表单实例管理该字段。表单中的多选初始值使用数组。独立受控用法可以直接传 `onChange={setValue}`。

## 定制点

颜色与间距沿用 `.yuki-select-root` 的样式变量。多选保留 `--yuki-multi-select-tag-gap`、`--yuki-multi-select-tag-remove-size` 和 `--yuki-multi-select-more-*`。标签节点支持 `classNames.tags`、`tag`、`tagLabel`、`tagRemove`、`more`。以 `data-open`、`data-invalid`、`data-disabled` 和 `data-multiple` 定位组件状态。

## 无障碍

提供可见 `label`、Form.Item 标签或 `aria-label`。触发器为 combobox，浮层包含 listbox，多选列表带 `aria-multiselectable`。可搜索时打开后聚焦输入框。

- 上下方向键移动高亮并跳过禁用项，Home / End 跳至首尾，Enter 或触发器上的空格提交。
- 关闭时输入字母可匹配选项。单选直接选中，多选展开并定位选项。
- Escape 关闭并将焦点还给触发器。关闭时 Backspace 可移除最后一个可移除标签，开启 `clearable` 后也可用 Delete 清空。
