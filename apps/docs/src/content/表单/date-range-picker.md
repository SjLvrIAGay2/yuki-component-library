---
title: DateRangePicker
group: 表单
description: 日期区间选择器。区间高亮、悬停预览、快捷预设、最小/最大日期与完整键盘操作。
order: 17
---

## 何时使用

需要选择一个连续日期区间（起止日期）时使用 DateRangePicker。单个日期请用 `DatePicker`，只需时间请用 `TimePicker`。

- 基础区间：`<DateRangePicker />`，面板使用区间模式日历
- 快捷选择：`presets` 提供“最近 7 天”“本月”等预设
- 限制范围：`min` / `max` / `disabledDate`
- 面板底部会实时显示当前选择（未完成时提示先选开始日期）

## 基础用法

`value` 为 `DateRange | null`，`onChange` 只在区间完整时回调 `{ start, end }`；先选结束早于开始时会自动交换。`startPlaceholder` / `endPlaceholder` 分别控制两端占位。

<Demo id="date-range-picker/01-basic" />

## 深度定制

- 预设：`presets: { label: ReactNode, value: DateRange }[]`，点击立即提交并关闭面板。
- 分隔符：`separator` 可传任意 `ReactNode`（默认 `~`）。
- 格式化：`format(date)` 同时作用于两端展示。
- 区间预览：面板内悬停会以 `--range` 修饰类预览区间，移出后恢复。
- 外观：`size`、`borderless`、`invalid`、`status` 与 `DatePicker` 一致。
- 类名/样式：`classNames.calendar` 与 `styles.calendar` 透传给内部 `DateCalendar`。

<Demo id="date-range-picker/02-custom" />

命名的 `Form.Item` 可以管理日期范围。通过表单设置 `{ start: Date, end: Date }` 初始值，选择两个端点后提交，清空时得到 `null`。快速预设同样遵守 `min`、`max` 和 `disabledDate` 对端点的限制。

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控区间 | `DateRange \| null` | — |
| defaultValue | 非受控初始值 | `DateRange \| null` | `null` |
| onChange | 区间完整时回调，清空时为 `null` | `(range: { start: Date; end: Date } \| null) => void` | — |
| onClear | 清除时触发 | `() => void` | — |
| open / defaultOpen / onOpenChange | 面板展开控制 | `boolean` / `boolean` / `(open) => void` | `false` |
| size | 尺寸 | `sm \| md \| lg` | 继承 ConfigProvider |
| startPlaceholder / endPlaceholder | 两端占位 | `ReactNode` | 继承 locale |
| separator | 分隔符 | `ReactNode` | `~` |
| presets | 快捷预设 | `{ label: ReactNode; value: DateRange }[]` | — |
| disabled / readOnly / invalid / status | 状态 | `boolean` / `boolean` / `boolean` / `SelectStatus` | — |
| clearable | 清除按钮 | `boolean` | `false` |
| min / max / disabledDate | 可选范围 | `Date` / `Date` / `(date) => boolean` | — |
| weekStartsOn | 每周起始日 | `0 \| 1` | `0` |
| format | 两端格式化 | `(date: Date) => string` | locale 短日期 |
| renderDay | 自定义日单元格 | `(date, state) => ReactNode` | — |
| prefix / suffix / showArrow / borderless / placement | 外观与浮层位置 | 同 DatePicker | — |
| name / required | 原生表单绑定（隐藏输入值为 `start~end`） | `string` / `boolean` | — |
| classNames / styles | 语义节点类名与样式 | `DateRangePickerClassNames` / `DateRangePickerStyles` | — |

### DateRange

`interface DateRange { start: Date | null; end: Date | null }`。

## 定制点

- **Token**：`.yuki-date-range-picker` 提供 `--yuki-date-range-picker-panel-padding`、`-preset-gap`、`-preset-padding`、`-separator-color`；日历样式复用 `.yuki-date-calendar` 的 token。
- **类名**：`classNames.root | trigger | panel | presets | preset | summary | separator | start | end | value | placeholder | prefix | suffix | clear | arrow | calendar`。
- **状态**：根节点 `data-size`、`data-open`、`data-disabled`、`data-invalid`、`data-status`、`data-value`（`start~end`）。
- **结构**：区间两端为触发器内部的 `start` / `separator` / `end` 三个节点，预设区在面板顶部、摘要在底部。

## 无障碍

- 触发器 `role="combobox"`，带 `aria-haspopup="dialog"`、`aria-expanded`、`aria-controls`；两端占位与值均随选择更新。
- 面板为 `role="dialog"`（`aria-label` 为“选择日期范围”），日历为 `role="grid"`，键盘导航与 `DatePicker` 完全一致；`Escape` 关闭并还原焦点。
- 区间状态以 `--range-start`、`--range-end`、`--range` 修饰类表达，颜色对比度使用语义 token，不单独依赖颜色传达起止。
- 预设按钮是原生 `<button>`，可被 Tab 与读屏依次访问。
