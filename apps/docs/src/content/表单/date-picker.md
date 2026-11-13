---
title: DatePicker
group: 表单
description: 日期选择器。日历面板、月切换、最小/最大日期、禁用日期、自定义格式与完整键盘操作。
order: 15
---

## 何时使用

输入单个日期时使用 DatePicker。需要日期区间请使用 `DateRangePicker`；只需要时分秒请使用 `TimePicker`。

- 基础选择：`<DatePicker />`
- 限制可选范围：`min` / `max` / `disabledDate`
- 需要特定格式展示：`format`
- 需要与表单联动：`name`、`required`、`status`、`invalid`

## 基础用法

`value` 为 `Date | null`（受控），`defaultValue` 为非受控初始值；`clearable` 提供清除按钮，面板底部“今天”按钮一键选择今天。

<Demo id="date-picker/01-basic" />

## 深度定制

- 展示格式：`format(date)` 只影响触发器文本，不影响无障碍名称（读屏使用完整日期）。
- 禁选规则：`disabledDate(date)` 与 `min`/`max` 同时生效，禁选日期在面板中带 `aria-disabled` 且不可点击。
- 每周起始：`weekStartsOn`（0 = 周日，1 = 周一）。
- 单元格：`renderDay(date, state)` 完全接管日单元格渲染，`state` 含 `selected/rangeStart/rangeEnd/inRange/today/outside/disabled/active`。
- 主题与尺寸：`size`、`borderless`、`status`、`invalid`，以及 `ConfigProvider` 的主题 token。
- 类名/样式：`classNames.calendar` 与 `styles.calendar` 会透传给内部 `DateCalendar`。

<Demo id="date-picker/02-custom" />

## API

### DatePicker

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label / description / error | 独立字段的标签、说明与错误提示 | ReactNode | — |
| value | 受控日期 | `Date \| null` | — |
| defaultValue | 非受控初始值 | `Date \| null` | `null` |
| onChange | 日期变化 | `(value: Date \| null, ...) => void` | — |
| onClear | 清除时触发 | `() => void` | — |
| open / defaultOpen / onOpenChange | 面板展开控制 | `boolean` / `boolean` / `(open) => void` | `false` |
| size | 尺寸 | `sm \| md \| lg` | 继承 ConfigProvider |
| placeholder | 占位内容 | `ReactNode` | 继承 locale |
| disabled / readOnly / invalid / status | 状态 | `boolean` / `boolean` / `boolean` / `SelectStatus` | — |
| clearable | 清除按钮 | `boolean` | `false` |
| min / max | 可选范围 | `Date` / `Date` | — |
| disabledDate | 自定义禁选 | `(date: Date) => boolean` | — |
| weekStartsOn | 每周起始日 | `0 \| 1` | `0` |
| format | 触发器格式化 | `(date: Date) => string` | locale 长日期 |
| renderDay | 自定义日单元格 | `(date, state) => ReactNode` | — |
| showToday | 显示“今天”按钮 | `boolean` | `true` |
| prefix / suffix | 触发器前后缀 | `ReactNode` | — |
| showArrow / borderless / placement | 外观与浮层位置 | `boolean` / `boolean` / `Placement` | `true` / `false` / `bottom` |
| name / required | 原生表单绑定 | `string` / `boolean` | — |
| classNames / styles | 语义节点类名与样式 | `DatePickerClassNames` / `DatePickerStyles` | — |

### DatePickerValue

`type DatePickerValue = Date | null`。

## 定制点

- **Token**：`.yuki-date-picker` 提供 `--yuki-date-picker-panel-padding`、`--yuki-date-picker-footer-gap`、`--yuki-date-picker-footer-padding-top`、`--yuki-date-picker-footer-border`；日历共享 `.yuki-date-calendar` 的 `--yuki-date-calendar-day-size`、`-gap`、`-nav-size`、`-title-color`、`-weekday-color`。
- **类名**：`classNames.root | trigger | panel | footer | today | value | placeholder | prefix | suffix | clear | arrow | calendar`；`calendar` 可进一步传 `DateCalendarClassNames`（`header/nav/title/weekdays/weekday/grid/row/cell/day/footer`）。
- **状态**：根节点 `data-size`、`data-open`、`data-disabled`、`data-invalid`、`data-status`、`data-value`；日单元格暴露 `data-date` 与 `--selected/--today/--outside/--disabled` 修饰类。
- **结构**：面板经 Portal 渲染，触发器为 `role="combobox"`，面板为 `role="dialog"`。

## 无障碍

- 触发器 `role="combobox"`，带 `aria-haspopup="dialog"`、`aria-expanded`、`aria-controls`。
- 日历为 `role="grid"`，列头为 `columnheader`，日期为 `gridcell` 内的按钮；每格提供完整 `aria-label`（含星期），今天带 `aria-current="date"`。
- 键盘：`ArrowLeft/Right` 前后一天，`ArrowUp/Down` 前后一周，`Home/End` 跳到本周首/尾，`PageUp/PageDown` 前后一月（按住 `Shift` 前后一年），`Enter/Space` 选中，`Escape` 关闭并把焦点还给触发器。
- `renderDay` 自定义后仍需保留可聚焦按钮与可访问名称，否则读屏无法选中日期。
