---
title: TimePicker
group: 表单
description: 时间选择器。时/分/秒滚动列、步进、最小/最大时间、格式化与完整键盘操作。
order: 16
---

## 何时使用

需要选择一天内的时间（`HH:mm` 或 `HH:mm:ss`）时使用 TimePicker。日期 + 时间请组合 `DatePicker` 与 `TimePicker` 使用。

- 基础时间：`<TimePicker />`
- 需要秒：`showSeconds`
- 步进选择：`minuteStep` / `secondStep`
- 限制范围：`min` / `max`（字符串 `HH:mm` 或 `HH:mm:ss`）

## 基础用法

`value` 为 `HH:mm`（或 `showSeconds` 时的 `HH:mm:ss`）字符串；面板按“时 / 分 / 秒”三列展示，选中即提交。

<Demo id="time-picker/01-basic" />

## 深度定制

- 步进：`minuteStep={15}`、`secondStep={10}` 只影响可选项。
- 范围：`min` / `max` 会禁用越界项（`aria-disabled`），交叉列选择时即时计算。
- 展示：`format(value)` 自定义触发器文本；面板顶部标题同步显示。
- “此刻”按钮：`showNow` 控制，点击选中当前时间并关闭。
- 外观：`size`、`borderless`、`status`、`invalid`。

<Demo id="time-picker/02-custom" />

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label / description / error | 独立字段的标签、说明与错误提示 | ReactNode | — |
| value | 受控时间 | `string \| null` | — |
| defaultValue | 非受控初始值 | `string \| null` | `null` |
| onChange | 时间变化 | `(value: string \| null, ...) => void` | — |
| onClear | 清除时触发 | `() => void` | — |
| open / defaultOpen / onOpenChange | 面板展开控制 | `boolean` / `boolean` / `(open) => void` | `false` |
| size | 尺寸 | `sm \| md \| lg` | 继承 ConfigProvider |
| placeholder | 占位内容 | `ReactNode` | 继承 locale |
| disabled / readOnly / invalid / status | 状态 | 与 Select 一致 | — |
| clearable | 清除按钮 | `boolean` | `false` |
| showSeconds | 显示秒列 | `boolean` | `false` |
| minuteStep / secondStep | 分钟/秒步进 | `number` / `number` | `1` / `1` |
| min / max | 可选时间范围 | `string` / `string` | — |
| format | 触发器格式化 | `(value: string) => string` | — |
| showNow | 显示“此刻”按钮 | `boolean` | `true` |
| prefix / suffix / showArrow / borderless / placement | 外观与浮层位置 | 同 DatePicker | — |
| name / required | 原生表单绑定 | `string` / `boolean` | — |
| classNames / styles | 语义节点类名与样式 | `TimePickerClassNames` / `TimePickerStyles` | — |

## 定制点

- **Token**：`.yuki-time-picker` 提供 `--yuki-time-picker-panel-padding`、`-column-width`、`-column-height`、`-option-height`、`-column-gap`、`-header-color`。
- **类名**：`classNames.root | trigger | panel | header | columns | column | columnTitle | columnList | option | footer | now | value | placeholder | prefix | suffix | clear | arrow`。
- **状态**：根节点 `data-size`、`data-open`、`data-disabled`、`data-invalid`、`data-status`、`data-value`。
- **结构**：每列是 `role="listbox"` 的 `<ul>`，选项为 `role="option"`，触发器 `role="combobox"`。

## 无障碍

- 每列可用方向键聚焦（点击列后焦点进入该列），`aria-activedescendant` 指向当前选中项，读屏播报“时/分/秒 + 值”。
- 键盘：`ArrowUp/Down` 上下移动并循环，`Home/End` 跳到首/尾，数字键快速定位，`Enter` 确认，`Escape` 关闭并把焦点还给触发器。
- 越界或不可用时间点使用 `aria-disabled="true"`，不可被确认。
- 面板打开后焦点自动进入小时列（Portal 异步挂载后通过微延迟聚焦），关闭后焦点回到触发器。
