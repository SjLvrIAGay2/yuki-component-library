---
title: 日历 Calendar
group: 数据展示
description: 以月视图展示日期并支持选择，可用于日程、预约与数据筛选。
order: 150
---

## 何时使用

- 需要按天选择日期（日程、预约、报表日期）时。
- 需要标记节假日、不可选日期或自定义单元格内容时。
- 需要控制每周起始日与月份切换时。

## 基础用法

<Demo id="calendar/01-basic" />

## 深度定制

<Demo id="calendar/02-custom" />

## API

### Calendar

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 受控选中日期 | Date | null | — |
| defaultValue | 非受控初始选中日期 | Date | null | — |
| onSelect | 选择日期回调 | (date: Date) => void | — |
| month | 受控展示月份 | Date | — |
| defaultMonth | 非受控初始展示月份 | Date | 当前月 |
| onMonthChange | 月份切换回调 | (month: Date) => void | — |
| weekStart | 每周起始日，0 为周日 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 0 |
| min / max | 最早及最晚可选日期，包含边界 | Date 或 YYYY-MM-DD 字符串 | — |
| disabledDate | 禁用某日期的判断函数 | (date: Date) => boolean | — |
| cellRender | 自定义单元格内容 | (date: Date, info: CalendarCellInfo) => ReactNode | — |
| headerRender | 自定义头部 | (info: CalendarHeaderInfo) => ReactNode | — |
| size | 尺寸：sm、md、lg | Size | 继承 ConfigProvider |
| bordered | 是否显示边框 | boolean | true |
| classNames | 语义节点类名 | CalendarClassNames | — |
| styles | 语义节点内联样式 | CalendarStyles | — |

### CalendarCellInfo

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| date | 单元格日期 | Date | — |
| inCurrentMonth | 是否属于当前展示月份 | boolean | — |
| selected | 是否选中 | boolean | — |
| today | 是否今天 | boolean | — |
| disabled | 是否禁用 | boolean | — |

## 定制点

- **设计 Token**：`--yuki-calendar-bg`、`--yuki-calendar-border-color`、`--yuki-calendar-radius`、`--yuki-calendar-padding`、`--yuki-calendar-cell-size`、`--yuki-calendar-cell-font-size`、`--yuki-calendar-cell-color`、`--yuki-calendar-cell-outside-color`、`--yuki-calendar-cell-hover-bg`、`--yuki-calendar-cell-selected-bg`、`--yuki-calendar-cell-selected-color`、`--yuki-calendar-cell-today-ring`、`--yuki-calendar-weekday-color`、`--yuki-calendar-duration/easing`。
- **类名与样式**：`classNames` 可覆盖 `root`、`header`、`title`、`nav`、`prev`、`next`、`weekdays`、`weekday`、`grid`、`row`、`cell`、`button` 十二个语义节点。；`className`、`style` 作用于根节点。
- **结构**：根节点带 `data-slot="calendar"` 与 `data-size`，`data-week-start`、`data-bordered` 表示配置；每个单元格按钮带 `data-selected`、`data-today`、`data-outside`、`data-disabled`。
- **行为**：受控与非受控用法一致，所有文案均可通过 ConfigProvider 的 locale 覆盖。

## 无障碍

- 完整日期网格使用 `grid` 语义，单元格是按钮；选中日 `aria-selected="true"`，今天 `aria-current="date"`，禁用日 `aria-disabled`。
- 采用 roving tabindex：Tab 进入当前可用的聚焦日期或当月第一个可选日期，方向键逐日移动、Home/End 到周首尾、PageUp/PageDown 切换月份、Enter/Space 选择。
- 月份标题与上/下月按钮都有可访问名称；月份切换后焦点跟随到目标日期。
